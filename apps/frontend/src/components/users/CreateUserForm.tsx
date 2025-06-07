import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, UserPlus } from "lucide-react";
import { UserFormData, User } from "@/interfaces/User";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ValidationErrors {
  [key: string]: string;
}

interface CreateUserFormProps {
  onCancel: () => void;
  onSuccess: (user: User) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value || value.trim().length < 2) {
          return "Name must be at least 2 characters";
        }
        return "";

      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) {
          return "Password must be at least 6 characters long";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "role") {
        const error = validateField(key, value as string);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleInputBlur =
    (field: keyof UserFormData) => (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as "USER" | "ADMIN" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.errors) {
          setErrors(errorData.errors);
        } else if (errorData.message) {
          setErrors({ general: errorData.message });
        } else {
          setErrors({ general: "Failed to create user" });
        }
        setIsSubmitting(false);
        return;
      }

      const createdUser = await response.json();
      onSuccess(createdUser.user);
    } catch (error) {
      console.error("Failed to create user:", error);
      setErrors({ general: "Network or server error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: keyof UserFormData,
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
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle className="text-2xl font-bold text-center">
          Create New User
        </DialogTitle>
        <DialogDescription className="text-center">
          Add a new user to the system
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {errors.general && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.general}</span>
          </div>
        )}

        {renderField("name", "Full Name", "text", "Enter full name")}
        {renderField("email", "Email Address", "email", "Enter email address")}
        {renderField("password", "Password", "password", "Enter password")}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateUserForm;
