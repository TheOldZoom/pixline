import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/userContext";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

import ShardsList from "@/components/shards/ShardsList";
import CreateShardForm from "@/components/shards/CreateShardForm";
import DeleteShardDialog from "@/components/shards/DeleteShardDialog";

import { Node } from "@/interfaces/Node";
import { Shard } from "@/interfaces/Shard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

// API calls
const fetchShards = async (token: string): Promise<Shard[]> => {
  const res = await fetch("/api/shards/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 502) {
      throw new Error("Failed to load shards");
    }
    throw new Error(await res.text());
  }
  return res.json();
};

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

const deleteShard = async (id: string, token: string) => {
  const res = await fetch(`/api/shards/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete shard");
};

const ShardsPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const [shards, setShards] = useState<Shard[]>([]);
  const [nodes, setNodes] = useState<Node[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedShard, setSelectedShard] = useState<Shard | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!user) return void router.push("/");
    if (user.role !== "ADMIN") return void router.push("/dashboard");

    const load = async () => {
      try {
        const [fetchedShards, fetchedNodes] = await Promise.all([
          fetchShards(user.token),
          fetchNodes(user.token),
        ]);
        setShards(fetchedShards);
        setNodes(fetchedNodes);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, router]);

  const handleShardCreated = (newShard: Shard) => {
    setShards((prev) => (prev ? [...prev, newShard] : [newShard]));
    setShowCreateDialog(false);
    toast.success("Shard created successfully");
  };

  const handleOpenDeleteDialog = (shard: Shard) => {
    setSelectedShard(shard);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedShard || !user) return;
    try {
      await deleteShard(selectedShard.id, user.token);
      setShards(
        (prev) => prev?.filter((shard) => shard.id !== selectedShard.id) || null
      );
      toast.success("Shard deleted successfully");
    } catch (err: any) {
      toast.error(`Error deleting shard: ${err.message}`);
    } finally {
      setShowDeleteDialog(false);
      setSelectedShard(null);
    }
  };

  if (!user) return null;

  return (
    <Container className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Shards</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading shards...</p>
      ) : error ? (
        <Card>
          <CardTitle>
            <h2 className="text-2xl font-semibold text-center">Error</h2>
          </CardTitle>
          <CardContent className="flex flex-col items-center justify-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : shards?.length === 0 ? (
        <div className="flex flex-col items-center justify-center my-20">
          <p className="text-muted-foreground mb-6">No shards found.</p>
          <Button
            size="lg"
            onClick={() => setShowCreateDialog(true)}
            className="px-12 py-4 text-xl"
            disabled={!nodes?.length}
          >
            Create Shard
          </Button>
          {!nodes?.length && (
            <p className="text-sm text-muted-foreground mt-4">
              You need to create nodes before creating shards.
            </p>
          )}
        </div>
      ) : (
        <>
          <ShardsList shards={shards} onDelete={handleOpenDeleteDialog} />
          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => setShowCreateDialog(true)}
              disabled={!nodes?.length}
            >
              Create Shard
            </Button>
          </div>
        </>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          {nodes && (
            <CreateShardForm
              nodes={nodes}
              onCancel={() => setShowCreateDialog(false)}
              onSuccess={handleShardCreated}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedShard && (
        <DeleteShardDialog
          shard={selectedShard}
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) setSelectedShard(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Container>
  );
};

export default ShardsPage;
