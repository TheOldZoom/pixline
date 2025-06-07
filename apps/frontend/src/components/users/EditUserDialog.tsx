import React, { useState, useEffect } from "react";
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
import { AlertCircle, UserCog } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
} from "@/components/ui/dialog";
import { User, UserFormData } from "@/interfaces/User";

interface ValidationErrors {
  [key: string]: string;
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UserFormData) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [user, open]);

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
        if (value && value.length < 6) {
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
      await onSave(formData);
      onOpenChange(false);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to save user" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const renderField = (
    name: keyof UserFormData,
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
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Edit User
          </DialogTitle>
          <DialogDescription className="text-center mb-6">
            Modify the details of <strong>{user.name}</strong>
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
          {renderField("name", "Full Name", "text", "Enter full name")}
          {renderField(
            "email",
            "Email Address",
            "email",
            "Enter email address"
          )}
          {renderField(
            "password",
            "Password (leave blank to keep current)",
            "password",
            "Enter new password"
          )}

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

export default EditUserDialog;
