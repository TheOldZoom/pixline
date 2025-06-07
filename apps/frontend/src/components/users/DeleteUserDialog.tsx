import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { User } from "@/interfaces/User";

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  error?: string | null;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onConfirm,
  error = null,
}) => {
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmInput("");
    }
  }, [open]);

  const handleClose = () => {
    setConfirmInput("");
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setConfirmInput("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            To confirm, please type the ID of <strong>{user.name}</strong>:
            <br />
            <code>{user.id}</code>
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <Input
          type="text"
          className={
            error ? "border-destructive focus-visible:ring-destructive" : ""
          }
          placeholder="Type the user ID here"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmInput !== user.id}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
