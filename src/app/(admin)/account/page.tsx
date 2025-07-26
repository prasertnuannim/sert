

import { columns, User } from "@/components/column/UserColumns";
import { DataTable } from "@/components/ui/data-table";


const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "admin" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "user" },
  { id: "3", name: "Charlie", email: "charlie@example.com", role: "admin" },
  { id: "4", name: "Diana", email: "diana@example.com", role: "user" },
  { id: "5", name: "Ethan", email: "ethan@example.com", role: "admin" },
  { id: "6", name: "Fiona", email: "fiona@example.com", role: "user" },
  { id: "7", name: "George", email: "george@example.com", role: "admin" },
  { id: "8", name: "Hannah", email: "hannah@example.com", role: "user" },
  { id: "9", name: "Isaac", email: "isaac@example.com", role: "admin" },
  { id: "10", name: "Jane", email: "jane@example.com", role: "user" },
  { id: "11", name: "Kevin", email: "kevin@example.com", role: "admin" },
  { id: "12", name: "Luna", email: "luna@example.com", role: "user" },
  { id: "13", name: "Max", email: "max@example.com", role: "admin" },
  { id: "14", name: "Nina", email: "nina@example.com", role: "user" },
  { id: "15", name: "Oscar", email: "oscar@example.com", role: "admin" },
  { id: "16", name: "Paula", email: "paula@example.com", role: "user" },
  { id: "17", name: "Quinn", email: "quinn@example.com", role: "admin" },
  { id: "18", name: "Rachel", email: "rachel@example.com", role: "user" },
  { id: "19", name: "Steve", email: "steve@example.com", role: "admin" },
  { id: "20", name: "Tina", email: "tina@example.com", role: "user" },
];


export default function UserTable() {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={users} />
    </div>
  );
}
