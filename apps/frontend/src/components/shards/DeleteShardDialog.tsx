import React, { useState } from "react";
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
import { Shard } from "@/interfaces/Shard";

interface DeleteShardDialogProps {
  shard: Shard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteShardDialog: React.FC<DeleteShardDialogProps> = ({
  shard,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [confirmInput, setConfirmInput] = useState("");

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
            To confirm, please type the ID of <strong>{shard.name}</strong>:
            <br />
            <code>{shard.id}</code>
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          className="w-full mt-2"
          placeholder="Type the shard ID here"
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
            disabled={confirmInput !== shard.id}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShardDialog;
