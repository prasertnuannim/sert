"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { getUsersAction, updateUserAction, deleteUserAction, createUserAction as baseCreateUserAction } from "./actions";
import { FullUser } from "@/types/account.type";
import { CreateUserModal } from "@/components/form/createUserModal";
import { DataTable, Column } from "@/components/form/dataTable";

const roleToText = (role: FullUser["role"] | string | undefined) =>
  typeof role === "string" ? role : role?.name ?? "";
type UserColumnKey = "name" | "email" | "role";

export default function AccountForm() {
  const [users, setUsers] = useState<FullUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const fetchUsers = useCallback(async (): Promise<FullUser[]> => {
    const result = await getUsersAction();
    if (result && "data" in result) {
      return result.data;
    }
    return [];
  }, []);

  const syncUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
      setIsModalOpen(false);
    } finally {
      setIsUsersLoading(false);
    }
  }, [fetchUsers]);

  const createUserAction = async (state: FullUser[], formData: FormData): Promise<FullUser[]> => {
    const result = await baseCreateUserAction(formData);
    if (result?.success) {
      const updated = await fetchUsers();
      return updated;
    }
    return state;
  };
  const [state, formAction, isCreatePending] = useActionState<FullUser[], FormData>(createUserAction, users);

  useEffect(() => {
    syncUsers();
  }, [syncUsers]);

  useEffect(() => {
    if (state && state.length >= users.length) {
      setUsers(state);
      setIsModalOpen(false);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateUser = async (id: string, values: Partial<FullUser>) => {
    const upd = {
      ...values,
      role:
        typeof values.role === "object" && values.role
          ? values.role.name
          : "",
    };
    await updateUserAction(id, upd);
    await syncUsers();
  };

  const handleHardDeleteUser = async (id: string) => {
    await deleteUserAction(id);
    await syncUsers();
  };

  const columns: Column<FullUser, UserColumnKey>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            roleToText(u.role) === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {roleToText(u.role)}
        </span>
      ),
      editor: ({ row, value, set }) => (
        <select
          value={roleToText(value)}
          onChange={(e) =>
            set(e.target.value ? { id: row.role?.id ?? "", name: e.target.value } : null)
          }
          className="border px-2 py-1 rounded w-full text-sm"
        >
          <option value="admin">admin</option>
          <option value="user">user</option>
        </select>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <DataTable<FullUser, UserColumnKey>
        data={users}
        columns={columns}
        initialPageSize={10}
        initialSort={{ key: "name", dir: "asc" }}
        searchPlaceholder="Search name / email / role…"
        isLoading={isUsersLoading || isCreatePending}
        onCreateClick={() => setIsModalOpen(true)}
        onUpdate={handleUpdateUser}
        onHardDelete={handleHardDeleteUser}
        confirmDeleteTitle="Delete this user permanently?"
        confirmDeleteDescription="This action cannot be undone."
        confirmDeleteText="Delete"
        confirmDeleteClassName="bg-red-600 text-white hover:bg-red-700"
        getConfirmDeleteProps={(row) => ({
          title: `Permanently delete “${row.name ?? row.email ?? row.id}”?`,
          description: "This record will be removed from the system forever.",
          confirmText: "Confirm delete",
        })}
      />

      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} formAction={formAction} />
    </div>
  );
}
