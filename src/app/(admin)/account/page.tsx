"use client";

import { useActionState, useEffect, useState } from "react";
import {
  getUsersAction,
  updateUserAction,
  deleteUserAction,
} from "./actions";
import { createUserAction as baseCreateUserAction } from "./actions";
import { FullUser } from "@/types/account.type";
import { CreateUserModal } from "@/components/form/CreateUserModal";
import { DataTable, Column } from "@/components/form/DataTable";

const roleToText = (r: unknown) =>
  typeof r === "string"
    ? r
    : (r as { name?: string })?.name ?? "";

export default function UserTable() {
  const [users, setUsers] = useState<FullUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Adapter สำหรับ useActionState (สร้างแล้ว refetch)
  const createUserAction = async (
    state: FullUser[],
    formData: FormData
  ): Promise<FullUser[]> => {
    const result = await baseCreateUserAction(formData);
    if (result?.success) {
      const updated = await getUsersAction();
      return (updated || []) as FullUser[];
    }
    return state;
  };
  const [state, formAction] = useActionState<FullUser[], FormData>(createUserAction, users);

  useEffect(() => {
    (async () => {
      const data = await getUsersAction();
      setUsers((data || []) as FullUser[]);
      setIsModalOpen(false);
    })();
  }, []);

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
        typeof values.role === "object"
          ? (values.role as { name: string })?.name
          : typeof values.role === "string"
          ? values.role
          : "",
    };
    await updateUserAction(id, upd);
    const updated = await getUsersAction();
    setUsers((updated || []) as FullUser[]);
  };

  const handleHardDeleteUser = async (id: string) => {
    await deleteUserAction(id);
    const updated = await getUsersAction();
    setUsers((updated || []) as FullUser[]);
  };

  const columns: Column<FullUser, keyof FullUser & string>[] = [
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
      editor: ({ value, set }) => (
        <select
          value={roleToText(value)}
          onChange={(e) => set(e.target.value as string)}
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
      <DataTable<FullUser, keyof FullUser & string>
        data={users}
        columns={columns}
        initialPageSize={10}
        initialSort={{ key: "name", dir: "asc" }}
        searchPlaceholder="Search name / email / role…"
        onCreateClick={() => setIsModalOpen(true)}
        onUpdate={handleUpdateUser}
        onHardDelete={handleHardDeleteUser}
        // คำยืนยันแบบคงที่ทั้งตาราง
        confirmDeleteTitle="ลบผู้ใช้นี้ถาวร?"
        confirmDeleteDescription="การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmDeleteText="ลบเลย"
        confirmDeleteClassName="bg-red-600 text-white hover:bg-red-700"
        // คำยืนยันแบบ dynamic ต่อแถว
        getConfirmDeleteProps={(row) => ({
          title: `ลบ “${row.name ?? row.email ?? row.id}” ถาวร ?`,
          description: "ข้อมูลจะถูกลบออกจากระบบอย่างถาวร",
          confirmText: "ยืนยันการลบ",
          // confirmClassName: "bg-rose-600 text-white hover:bg-rose-700",
        })}
      />

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formAction={formAction}
      />
    </div>
  );
}
