"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RBTForm } from "@/components/rbts/rbt-form";
import { deleteRBT } from "./actions";
import type { RBT } from "@/types";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function RBTList({ rbts }: { rbts: RBT[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRBT, setEditingRBT] = useState<RBT | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleEdit(rbt: RBT) {
    setEditingRBT(rbt);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingRBT(null);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this RBT?")) return;
    setDeletingId(id);
    try {
      await deleteRBT(id);
      toast.success("RBT deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">RBTs</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add RBT
        </Button>
      </div>

      {rbts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No RBTs added yet. Click &quot;Add RBT&quot; to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Certification #</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rbts.map((rbt) => (
                <TableRow key={rbt.id}>
                  <TableCell className="font-medium">{rbt.full_name}</TableCell>
                  <TableCell>{rbt.certification_number || "—"}</TableCell>
                  <TableCell>{rbt.email || "—"}</TableCell>
                  <TableCell>{rbt.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={rbt.is_active ? "default" : "secondary"}>
                      {rbt.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(rbt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rbt.id)}
                        disabled={deletingId === rbt.id}
                      >
                        {deletingId === rbt.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RBTForm
        key={editingRBT?.id ?? "new"}
        rbt={editingRBT}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
