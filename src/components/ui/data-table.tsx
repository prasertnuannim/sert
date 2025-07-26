"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "./button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name?: string; email?: string }>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { rowSelection, globalFilter, sorting },
  });

  const isEditing = (id: string) => editingRowId === id;

  const handleEdit = (row: TData) => {
    setEditingRowId(row.id);
    setEditValues({
      name: (row as TData & { name?: string }).name,
      email: (row as TData & { email?: string }).email,
    });
  };

  const handleSave = (id: string) => {
    console.log("📝 Updated:", { id, ...editValues });
    setEditingRowId(null);
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditValues({});
  };

  const handleDelete = (id: string) => {
    console.log("🗑️ Deleted:", id);
    // Implement delete logic here
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between px-4 py-2">
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm w-full max-w-xs"
        />
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                 {header.column.getCanSort() && (
  <span className="ml-1 text-muted-foreground inline-block">
    {header.column.getIsSorted() === "asc" && <ChevronUp size={14} />}
    {header.column.getIsSorted() === "desc" && <ChevronDown size={14} />}
    {!header.column.getIsSorted() && <ArrowUpDown size={14} />}
  </span>
)}

                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const columnId = cell.column.id;
                  const isEditable =
                    columnId === "name" || columnId === "email";

                  return (
                    <TableCell key={cell.id}>
                      {isEditing(row.original.id) && isEditable ? (
                        <input
                          value={editValues[columnId] ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [columnId]: e.target.value,
                            }))
                          }
                          className="border px-2 py-1 rounded w-full text-sm"
                        />
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  );
                })}

                {/* Actions Column */}
                <TableCell>
                  {isEditing(row.original.id) ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(row.original.id)}
                        className="text-green-600 text-sm"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => handleCancel()}
                        className="text-gray-600 text-sm"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 text-gray-500 hover:text-black disabled:opacity-30"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 text-gray-500 hover:text-black disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 text-gray-500 hover:text-black disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 text-gray-500 hover:text-black disabled:opacity-30"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
