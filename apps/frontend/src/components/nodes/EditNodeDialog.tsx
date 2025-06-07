import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Server } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
} from "@/components/ui/dialog";
import { Node, NodeFormData } from "@/interfaces/Node";

interface ValidationErrors {
  [key: string]: string;
}

interface EditNodeDialogProps {
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: NodeFormData) => void;
}

const EditNodeDialog: React.FC<EditNodeDialogProps> = ({
  node,
  open,
  onOpenChange,
  onSave,
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

  useEffect(() => {
    if (node && open) {
      setFormData({
        identifier: node.identifier,
        port: node.port.toString(),
        label: node.label,
        location: node.location,
        ssl: node.ssl,
        secret_key: node.secret_key,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [node, open]);

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
          return "Identifier must be a valid IP or domain";
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
          return "Secret key must be at least 6 characters long";
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
      await onSave({
        ...formData,
        port: formData.port,
      });
      onOpenChange(false);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to save node" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const renderField = (
    name: keyof NodeFormData,
    label: string,
    type: string = "text",
    placeholder?: string
  ) => (
    <div className="space-y-1">
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Edit Node
          </DialogTitle>
          <DialogDescription className="text-center mb-6">
            Modify the details of <strong>{node.label}</strong>
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.general}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {renderField(
            "identifier",
            "Node Identifier (IP address or domain)",
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

          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNodeDialog;
