import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Database, Users } from "lucide-react";
import { Shard } from "@/interfaces/Shard";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ShardsListProps {
  shards: Shard[];
  onDelete: (shard: Shard) => void;
  onEdit?: (shard: Shard) => void;
}

const ShardsList: React.FC<ShardsListProps> = ({
  shards,
  onDelete,
  onEdit,
}) => {
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
      {shards.map((shard) => (
        <li key={shard.id}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {shard.name}
              </CardTitle>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    More
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => copyToClipboard(shard.id)}
                  >
                    Copy ID
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onEdit(shard)}
                    >
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => onDelete(shard)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Node:</span>{" "}
                  {shard.node ? shard.node.label : "Unknown Node"}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{shard.users?.length || 0} users</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(shard.createdAt), {
                    addSuffix: true,
                  })}
                </p>

                <p className="text-xs text-muted-foreground mt-2">
                  ID: {shard.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};

export default ShardsList;
