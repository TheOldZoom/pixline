import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Node } from "@/interfaces/Node";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface NodesListProps {
  nodes: Node[];
  onDelete: (node: Node) => void;
  onEdit?: (node: Node) => void;
}

const NodesList: React.FC<NodesListProps> = ({ nodes, onDelete, onEdit }) => {
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
      {nodes.map((node) => (
        <li key={node.identifier}>
          <Card className="relative pt-10 hover:shadow-lg transition-shadow duration-200">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur border shadow-md ${
                  node.status === "ONLINE"
                    ? "bg-green-800 border-4 border-green-900"
                    : "bg-red-800 border-4 border-red-900"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    node.status === "ONLINE" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {node.status}
              </div>
            </div>

            <CardHeader className="flex justify-between items-center">
              <CardTitle>{node.label}</CardTitle>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Show More
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => copyToClipboard(node.id)}
                  >
                    Copy ID
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onEdit(node)}
                    >
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => onDelete(node)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Identifier:</strong> {node.identifier}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Port:</strong> {node.port}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Location:</strong> {node.location}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Shards:</strong> {node.shards.length}
                </p>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <strong>SSL Enabled:</strong>
                  <input type="checkbox" checked={node.ssl} disabled />
                </p>

                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(node.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ID: {node.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};

export default NodesList;
