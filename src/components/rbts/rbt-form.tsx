"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createRBT, updateRBT } from "@/app/dashboard/rbts/actions";
import type { RBT } from "@/types";
import toast from "react-hot-toast";

interface RBTFormProps {
  rbt?: RBT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RBTForm({ rbt, open, onOpenChange }: RBTFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!rbt;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (isEditing) {
        await updateRBT(rbt!.id, formData);
        toast.success("RBT updated");
      } else {
        await createRBT(formData);
        toast.success("RBT added");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit RBT" : "Add RBT"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={rbt?.full_name || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certification_number">Certification Number</Label>
            <Input
              id="certification_number"
              name="certification_number"
              defaultValue={rbt?.certification_number || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={rbt?.email || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={rbt?.phone || ""}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add RBT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
