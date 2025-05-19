import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Server } from "lucide-react";
import { useUser } from "@/lib/userContext";
import { useRouter } from "next/router";
import { NodeFormData } from "@/interfaces/Node";

interface ValidationErrors {
  [key: string]: string;
}

const CreateNodeForm = () => {
  const [formData, setFormData] = useState<NodeFormData>({
    identifier: "",
    port: "",
    label: "",
    location: "",
    ssl: false,
    secret_key: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user === null) {
      return;
    }
    if (!user) {
      router.push("/");
    }

    if (user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user) return null;

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case "identifier":
        return !value || (value as string).trim().length === 0
          ? "Identifier is required"
          : "";
      case "port":
        const portNum = parseInt(value as string);
        if (!value || isNaN(portNum)) return "Port is required";
        if (portNum < 1 || portNum > 65535)
          return "Port must be between 1 and 65535";
        return "";
      case "label":
        return !value || (value as string).trim().length === 0
          ? "Label is required"
          : "";
      case "location":
        return !value || (value as string).trim().length === 0
          ? "Location is required"
          : "";
      case "secret_key":
        return !value || (value as string).trim().length === 0
          ? "Secret key is required"
          : "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof NodeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error on input change
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ssl: checked }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const nodeData = {
        ...formData,
        port: parseInt(formData.port),
      };

      console.log("Creating node:", nodeData);

      const response = await fetch("/api/nodes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(nodeData),
      });

      const data = await response.json();
      console.log(data);

      setFormData({
        identifier: "",
        port: "",
        label: "",
        location: "",
        ssl: false,
        secret_key: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Failed to create node:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: keyof NodeFormData,
    label: string,
    type: string = "text",
    placeholder?: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={formData[name] as string}
        onChange={handleInputChange(name)}
        className={
          errors[name]
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }
        disabled={isSubmitting}
      />
      {errors[name] && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create New Node</CardTitle>
          <p className="text-muted-foreground">
            Configure your node settings below
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {renderField(
              "identifier",
              "Node Identifier (The IP address or domain name)",
              "text",
              "Enter unique identifier"
            )}
            {renderField("port", "Port Number", "number", "e.g., 8080")}
            {renderField(
              "label",
              "Display Label",
              "text",
              "Enter display name"
            )}
            {renderField(
              "location",
              "Location",
              "text",
              "Enter server location"
            )}
            {renderField(
              "secret_key",
              "Secret Key",
              "password",
              "Enter secret key"
            )}

            <div className="flex items-center space-x-3">
              <Checkbox
                id="ssl"
                checked={formData.ssl}
                onCheckedChange={handleCheckboxChange}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="ssl"
                className="text-sm font-medium cursor-pointer"
              >
                Enable SSL/TLS Encryption
              </Label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Node...
                </>
              ) : (
                "Create Node"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNodeForm;
