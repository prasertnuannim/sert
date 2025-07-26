'use client'

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
  accessorKey: "role",
  header: "Role",
  cell: ({ row }) => {
    const role = row.getValue("role") as string;

    return (
      <Badge variant={role === "admin" ? "default" : "secondary"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  },
  enableSorting: true, // optional
  enableGlobalFilter: true, // optional
}
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <div className="flex gap-2">
  //       <Button variant="outline" size="sm" onClick={() => alert(`Edit ${row.original.id}`)}>
  //         <Pencil size={18} />
  //       </Button>
  //       <Button variant="destructive" size="sm" onClick={() => alert(`Delete ${row.original.id}`)}>
  //         <Trash2 size={18} />
  //       </Button>
  //     </div>
  //   ),
  // },
];
