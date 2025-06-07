import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Server } from "lucide-react";
import { NodeFormData, Node } from "@/interfaces/Node";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ValidationErrors {
  [key: string]: string;
}

interface CreateNodeFormProps {
  onCancel: () => void;
  onSuccess: (node: Node) => void;
}

const CreateNodeForm: React.FC<CreateNodeFormProps> = ({
  onCancel,
  onSuccess,
}) => {
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

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case "identifier":
        if (!value || (value as string).trim() === "") {
          return "Identifier is required";
        }
        const trimmedId = (value as string).trim();
        const ipRegex =
          /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,11}?$/;
        if (!ipRegex.test(trimmedId) && !domainRegex.test(trimmedId)) {
          return "Identifier must be a valid IP address or domain name";
        }
        return "";

      case "port":
        if (!value) return "Port is required";
        const portNum = Number(value);
        if (!Number.isInteger(portNum)) return "Port must be an integer";
        if (portNum < 1 || portNum > 65535)
          return "Port must be between 1 and 65535";
        return "";

      case "label":
        if (!value || (value as string).trim().length < 2)
          return "Label must be at least 2 characters";
        return "";

      case "location":
        if (!value || (value as string).trim().length < 2)
          return "Location must be at least 2 characters";
        return "";

      case "secret_key":
        const secret = (value as string).trim();
        if (!secret) return "Secret key is required";
        if (secret.length < 6)
          return "Secret key must be at least 8 characters long";
        return "";

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

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleInputBlur =
    (field: keyof NodeFormData) => (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ssl: checked }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const nodeData = {
        ...formData,
        port: parseInt(formData.port),
      };

      const response = await fetch("/api/nodes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(nodeData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.errors) {
          setErrors(errorData.errors);
        } else if (errorData.message) {
          setErrors({ general: errorData.message });
        } else {
          setErrors({ general: "Failed to create node" });
        }
        setIsSubmitting(false);
        return;
      }

      const createdNode = await response.json();
      onSuccess(createdNode.node);
    } catch (error) {
      console.error("Failed to create node:", error);
      setErrors({ general: "Network or server error occurred" });
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
        onBlur={handleInputBlur(name)}
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
    <>
      <DialogHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Server className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle className="text-2xl font-bold text-center">
          Create New Node
        </DialogTitle>
        <DialogDescription className="text-center">
          Configure your node settings below
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {errors.general && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.general}</span>
          </div>
        )}

        {renderField(
          "identifier",
          "Node Identifier (The IP address or domain name)",
          "text",
          "Enter unique identifier"
        )}
        {renderField("port", "Port Number", "number", "e.g., 8080")}
        {renderField("label", "Display Label", "text", "Enter display name")}
        {renderField("location", "Location", "text", "Enter server location")}
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
          <Label htmlFor="ssl" className="text-sm font-medium cursor-pointer">
            Enable SSL/TLS Encryption
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Node"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateNodeForm;
