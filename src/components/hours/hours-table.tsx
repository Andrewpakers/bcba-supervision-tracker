"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { upsertMonthlyHours } from "@/app/dashboard/hours/actions";
import type { RBT } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  rbts: RBT[];
  hoursByRBT: Record<string, number>;
  supervisedByRBT: Record<string, number>;
  month: number;
  year: number;
}

export function HoursTable({ rbts, hoursByRBT, supervisedByRBT, month, year }: Props) {
  const router = useRouter();
  const [localHours, setLocalHours] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const rbt of rbts) {
      initial[rbt.id] = hoursByRBT[rbt.id]?.toString() || "";
    }
    return initial;
  });

  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    router.push(`/dashboard/hours?month=${newMonth}&year=${newYear}`);
  }

  async function handleSave(rbtId: string) {
    const value = parseFloat(localHours[rbtId] || "0");
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    try {
      await upsertMonthlyHours(rbtId, month, year, value);
      toast.success("Hours saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monthly Practice Hours</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium min-w-[180px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {rbts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No active RBTs. Add RBTs first to enter hours.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RBT</TableHead>
                <TableHead className="w-[160px]">Practice Hours</TableHead>
                <TableHead className="text-right">Required (5%)</TableHead>
                <TableHead className="text-right">Supervised</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rbts.map((rbt) => {
                const practiceHours = parseFloat(localHours[rbt.id] || "0") || 0;
                const required = practiceHours * 0.05;
                const supervised = supervisedByRBT[rbt.id] || 0;
                const remaining = Math.max(0, required - supervised);

                return (
                  <TableRow key={rbt.id}>
                    <TableCell className="font-medium">{rbt.full_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={localHours[rbt.id] || ""}
                        placeholder="0"
                        onChange={(e) =>
                          setLocalHours((prev) => ({
                            ...prev,
                            [rbt.id]: e.target.value,
                          }))
                        }
                        onBlur={() => handleSave(rbt.id)}
                        className="w-[120px]"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {required.toFixed(2)}h
                    </TableCell>
                    <TableCell className="text-right">
                      {supervised.toFixed(2)}h
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        remaining > 0 ? "text-red-600" : "text-green-600"
                      )}
                    >
                      {remaining > 0 ? `${remaining.toFixed(2)}h` : "Met"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(rbt.id)}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
