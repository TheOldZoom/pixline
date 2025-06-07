import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/userContext";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

import NodesList from "@/components/nodes/NodeList";
import CreateNodeForm from "@/components/nodes/CreateNodeForm";
import DeleteNodeDialog from "@/components/nodes/DeleteNodeDialog";
import EditNodeDialog from "@/components/nodes/EditNodeDialog";

import { Node, NodeFormData } from "@/interfaces/Node";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

// API calls
const fetchNodes = async (token: string): Promise<Node[]> => {
  const res = await fetch("/api/nodes/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 502) {
      throw new Error("Failed to load nodes");
    }
    throw new Error(await res.text());
  }
  return res.json();
};

const deleteNode = async (id: string, token: string) => {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    if (res.status === 409) {
      const data = await res.json();
      throw new Error(
        data.message || "Cannot delete node due to related shards."
      );
    }
    throw new Error("Failed to delete node");
  }
};

const updateNode = async (
  id: string,
  data: NodeFormData,
  token: string
): Promise<Node> => {
  const payload = { ...data, port: parseInt(data.port, 10) };
  const res = await fetch(`/api/nodes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update node");
  return res.json();
};

const NodesPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null) return;
    if (!user) return void router.push("/");
    if (user.role !== "ADMIN") return void router.push("/dashboard");

    const load = async () => {
      try {
        const fetchedNodes = await fetchNodes(user.token);
        setNodes(fetchedNodes);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Failed to load nodes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, router]);

  const handleNodeCreated = (newNode: Node) => {
    setNodes((prev) => [...prev, newNode]);
    setShowCreateDialog(false);
    toast.success("Node created successfully");
  };

  const handleOpenDeleteDialog = (node: Node) => {
    setSelectedNode(node);
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNode || !user) return;

    setDeleteError(null);

    try {
      await deleteNode(selectedNode.id, user.token);
      setNodes((prev) => prev.filter((node) => node.id !== selectedNode.id));
      toast.success("Node deleted successfully");
      setShowDeleteDialog(false);
      setSelectedNode(null);
    } catch (err: any) {
      setDeleteError(err.message);
    }
  };

  const handleOpenEditDialog = (node: Node) => {
    setSelectedNode(node);
    setShowEditDialog(true);
  };

  const handleSaveNode = async (updatedData: NodeFormData) => {
    if (!selectedNode || !user) return;

    try {
      const updatedNode = await updateNode(
        selectedNode.id,
        updatedData,
        user.token
      );
      setNodes((prev) =>
        prev.map((node) => (node.id === updatedNode.id ? updatedNode : node))
      );
      setShowEditDialog(false);
      setSelectedNode(null);
      toast.success("Node updated successfully");
    } catch (err: any) {
      toast.error(`Error updating node: ${err.message}`);
    }
  };

  if (!user) return null;

  return (
    <Container className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Nodes</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading nodes...</p>
      ) : error ? (
        <Card>
          <CardTitle>
            <h2 className="text-2xl font-semibold text-center">Error</h2>
          </CardTitle>
          <CardContent className="flex flex-col items-center justify-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : nodes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center my-20">
          <p className="text-muted-foreground mb-6">No nodes found.</p>
          <Button
            size="lg"
            onClick={() => setShowCreateDialog(true)}
            className="px-12 py-4 text-xl"
          >
            Create Node
          </Button>
        </div>
      ) : (
        <>
          <NodesList
            nodes={nodes}
            onDelete={handleOpenDeleteDialog}
            onEdit={handleOpenEditDialog}
          />
          <div className="mt-8 flex justify-end">
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Node
            </Button>
          </div>
        </>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <CreateNodeForm
            onCancel={() => setShowCreateDialog(false)}
            onSuccess={handleNodeCreated}
          />
        </DialogContent>
      </Dialog>

      {selectedNode && (
        <DeleteNodeDialog
          node={selectedNode}
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) {
              setSelectedNode(null);
              setDeleteError(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          error={deleteError}
        />
      )}

      {selectedNode && (
        <EditNodeDialog
          node={selectedNode}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setSelectedNode(null);
          }}
          onSave={handleSaveNode}
        />
      )}
    </Container>
  );
};

export default NodesPage;
