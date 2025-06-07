import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Database } from "lucide-react";
import { Shard, ShardFormData } from "@/interfaces/Shard";
import { Node } from "@/interfaces/Node";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValidationErrors {
  [key: string]: string;
}

interface CreateShardFormProps {
  nodes: Node[];
  onCancel: () => void;
  onSuccess: (shard: Shard) => void;
}

const CreateShardForm: React.FC<CreateShardFormProps> = ({
  nodes,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ShardFormData>({
    name: "",
    nodeId: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value || value.trim().length < 2) {
          return "Name must be at least 2 characters";
        }
        if (value.length > 32) {
          return "Name must not exceed 32 characters";
        }
        if (/\s/.test(value)) {
          return "Name must not contain spaces";
        }
        return "";
      case "nodeId":
        if (!value) {
          return "Node is required";
        }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNodeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, nodeId: value }));

    if (errors.nodeId) {
      setErrors((prev) => ({ ...prev, nodeId: "" }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/shards/create", {
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
          setErrors({ general: "Failed to create shard" });
        }
        setIsSubmitting(false);
        return;
      }

      const createdShard = await response.json();
      onSuccess(createdShard.shard);
    } catch (error) {
      console.error("Failed to create shard:", error);
      setErrors({ general: "Network or server error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle className="text-2xl font-bold text-center">
          Create New Shard
        </DialogTitle>
        <DialogDescription className="text-center">
          Configure your shard settings below
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {errors.general && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.general}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Shard Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter shard name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={
              errors.name
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            disabled={isSubmitting}
          />
          {errors.name && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nodeId" className="text-sm font-medium">
            Node
          </Label>
          <Select
            value={formData.nodeId}
            onValueChange={handleNodeChange}
            disabled={isSubmitting}
          >
            <SelectTrigger
              className={
                errors.nodeId
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            >
              <SelectValue placeholder="Select a node" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.label} ({node.identifier})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.nodeId && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.nodeId}</span>
            </div>
          )}
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
            {isSubmitting ? "Creating..." : "Create Shard"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateShardForm;
