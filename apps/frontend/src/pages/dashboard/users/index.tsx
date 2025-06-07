import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/userContext";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User } from "@/interfaces/User";
import { UserFormData } from "@/interfaces/User";
import UsersList from "@/components/users/UsersList";
import CreateUserForm from "@/components/users/CreateUserForm";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";

const getUsers = async (user: User) => {
  const token = user.token;

  const response = await fetch("/api/users/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data as User[];
};

function UsersPage() {
  const { user } = useUser();
  const router = useRouter();

  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

    fetchUsers();
  }, [user, router]);

  const fetchUsers = () => {
    if (!user) return;

    setLoading(true);
    getUsers(user)
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setUsers(null);
      })
      .finally(() => setLoading(false));
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleUserCreated = (newUser: User) => {
    setUsers((prevUsers) => (prevUsers ? [...prevUsers, newUser] : [newUser]));
    setCreateDialogOpen(false);
  };

  const handleOpenDeleteDialog = (userToDelete: User) => {
    setSelectedUser(userToDelete);
    setDeleteDialogOpen(true);
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteUser = () => {
    if (selectedUser && user) {
      setDeleteError(null);
      fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id: selectedUser.id }),
      })
        .then(async (res) => {
          if (res.ok) {
            setUsers((prevUsers) =>
              prevUsers
                ? prevUsers.filter((u) => u.id !== selectedUser.id)
                : null
            );
            setDeleteDialogOpen(false);
            setSelectedUser(null);
          } else if (res.status === 400) {
            const data = await res.json();
            setDeleteError(
              data.message || "Cannot delete user due to dependencies."
            );
          } else {
            throw new Error("Failed to delete user");
          }
        })
        .catch((err) => {
          setDeleteError(err.message);
        });
    }
  };

  const handleOpenEditDialog = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async (updatedData: UserFormData) => {
    if (!selectedUser || !user) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = (await response.json()) as User;

      setUsers((prevUsers) =>
        prevUsers
          ? prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          : [updatedUser]
      );

      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <Container className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      {loading && <p className="text-muted-foreground">Loading users...</p>}

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md border border-red-300">
          Error: {error}
        </div>
      )}

      {!loading && users && users.length === 0 && (
        <div className="flex flex-col items-center justify-center my-20">
          <p className="text-muted-foreground mb-6">No users found.</p>
          <Button
            size="lg"
            onClick={handleOpenCreateDialog}
            className="px-12 py-4 text-xl"
          >
            Create User
          </Button>
        </div>
      )}

      {!loading && users && users.length > 0 && (
        <>
          <UsersList
            users={users}
            onDelete={handleOpenDeleteDialog}
            onEdit={handleOpenEditDialog}
          />

          <div className="mt-8 flex justify-end">
            <Button onClick={handleOpenCreateDialog}>Create User</Button>
          </div>
        </>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <CreateUserForm
            onCancel={() => setCreateDialogOpen(false)}
            onSuccess={handleUserCreated}
          />
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <DeleteUserDialog
          user={selectedUser}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setSelectedUser(null);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDeleteUser}
          error={deleteError}
        />
      )}

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </Container>
  );
}

export default UsersPage;
