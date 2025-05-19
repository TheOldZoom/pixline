import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/userContext";
import Container from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User } from "@/interfaces/User";

export interface Node {
  identifier: string;
  port: number;
  label: string;
  location: string;
  ssl: boolean;
  secret_key: string;
}

const getNodes = async (user: User) => {
  const token = user.token;

  const response = await fetch("/api/nodes/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch nodes");
  }

  const data = await response.json();
  return data as Node[];
};

function Nodes() {
  const { user } = useUser();
  const router = useRouter();

  const [nodes, setNodes] = useState<Node[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    getNodes(user)
      .then((data) => {
        setNodes(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setNodes(null);
      })
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user) return null;

  return (
    <Container className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Nodes</h1>

      {loading && <p className="text-muted-foreground">Loading nodes...</p>}

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md border border-red-300">
          Error: {error}
        </div>
      )}

      {!loading && nodes && nodes.length === 0 && (
        <p className="text-muted-foreground">No nodes found.</p>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes?.map((node) => (
          <li key={node.identifier}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{node.label}</CardTitle>

                {/* Dropdown Menu Trigger */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Show More
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => alert(`Edit node ${node.identifier}`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete node ${node.label}?`
                          )
                        ) {
                          alert(`Deleting node ${node.identifier}`);
                          // Add delete logic here
                        }
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Identifier:</strong> {node.identifier}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Location:</strong> {node.location}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Port:</strong> {node.port}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>SSL Enabled:</strong>{" "}
                  <span
                    className={node.ssl ? "text-green-600" : "text-red-600"}
                  >
                    {node.ssl ? "Yes" : "No"}
                  </span>
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}

export default Nodes;
