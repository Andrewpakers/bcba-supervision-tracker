"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSession,
  updateSession,
  deleteSession,
} from "@/app/dashboard/calendar/actions";
import type { RBT, Client, SupervisionSession } from "@/types";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface SessionFormProps {
  session?: SupervisionSession | null;
  rbts: RBT[];
  clients: Client[];
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function SessionForm({
  session,
  rbts,
  clients,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  open,
  onOpenChange,
  onSaved,
}: SessionFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!session;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.currentTarget;
      const startTime = (form.elements.namedItem("start_time") as HTMLInputElement).value;
      const endTime = (form.elements.namedItem("end_time") as HTMLInputElement).value;

      if (endTime <= startTime) {
        toast.error("End time must be after start time");
        setLoading(false);
        return;
      }

      const data = {
        rbt_id: (form.elements.namedItem("rbt_id") as HTMLSelectElement).value,
        client_id: (form.elements.namedItem("client_id") as HTMLSelectElement).value,
        session_date: (form.elements.namedItem("session_date") as HTMLInputElement).value,
        start_time: startTime,
        end_time: endTime,
        notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value || undefined,
      };

      if (isEditing) {
        await updateSession(session!.id, data);
        toast.success("Session updated");
      } else {
        await createSession(data);
        toast.success("Session created");
      }
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!session || !confirm("Delete this supervision session?")) return;
    setLoading(true);
    try {
      await deleteSession(session.id);
      toast.success("Session deleted");
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Supervision Session" : "New Supervision Session"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session_date">Date *</Label>
            <Input
              id="session_date"
              name="session_date"
              type="date"
              defaultValue={session?.session_date || defaultDate || ""}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={session?.start_time?.slice(0, 5) || defaultStartTime || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={session?.end_time?.slice(0, 5) || defaultEndTime || ""}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rbt_id">RBT *</Label>
            <select
              id="rbt_id"
              name="rbt_id"
              defaultValue={session?.rbt_id || ""}
              required
              aria-label="Select RBT"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select RBT...</option>
              {rbts.map((rbt) => (
                <option key={rbt.id} value={rbt.id}>
                  {rbt.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <select
              id="client_id"
              name="client_id"
              defaultValue={session?.client_id || ""}
              required
              aria-label="Select Client"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select Client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={session?.notes || ""}
              placeholder="Optional session notes..."
            />
          </div>
          <div className="flex justify-between">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
