import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User } from "@/interfaces/User";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface UsersListProps {
  users: User[];
  onDelete: (user: User) => void;
  onEdit?: (user: User) => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onDelete, onEdit }) => {
  const copyToClipboard = (id: string) => {
    if (
      typeof window !== "undefined" &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost")
    ) {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(id)
          .then(() => {
            toast("Copied to clipboard!");
          })
          .catch((err) => {
            toast("Failed to copy to clipboard");
            console.error("Failed to copy:", err);
          });
      }
    } else {
      toast("Clipboard API not available.");
    }
  };

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <li key={user.id}>
          <Card className="relative pt-10 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{user.name}</CardTitle>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Show More
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => copyToClipboard(user.id)}
                  >
                    Copy ID
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => onDelete(user)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Email:</strong>{" "}
                  {user.email.replace(/(.{1,3})(.*)(@.*)/, "$1***$3")}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Role:</strong>{" "}
                  {user.role
                    .toLowerCase()
                    .replace(/^./, (c) => c.toUpperCase())}
                </p>

                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ID: {user.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};

export default UsersList;
