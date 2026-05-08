import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function DashboardPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const supabase = await createClient();

  const [rbtsResult, hoursResult, sessionsResult] = await Promise.all([
    supabase.from("rbts").select("*").eq("is_active", true).order("full_name"),
    supabase
      .from("monthly_hours")
      .select("*")
      .eq("month", month)
      .eq("year", year),
    supabase
      .from("supervision_sessions")
      .select("rbt_id, duration_hours")
      .gte("session_date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lt(
        "session_date",
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, "0")}-01`
      ),
  ]);

  const rbts = rbtsResult.data || [];
  const monthlyHours = hoursResult.data || [];
  const sessions = sessionsResult.data || [];

  const supervisedByRBT: Record<string, number> = {};
  for (const s of sessions) {
    supervisedByRBT[s.rbt_id] =
      (supervisedByRBT[s.rbt_id] || 0) + Number(s.duration_hours);
  }

  const hoursByRBT: Record<string, number> = {};
  for (const h of monthlyHours) {
    hoursByRBT[h.rbt_id] = Number(h.total_practice_hours);
  }

  const totalSupervised = Object.values(supervisedByRBT).reduce((a, b) => a + b, 0);
  const totalRequired = Object.values(hoursByRBT).reduce((a, b) => a + b * 0.05, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Dashboard — {MONTH_NAMES[month - 1]} {year}
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active RBTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rbts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Supervision Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRequired.toFixed(2)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Supervised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSupervised.toFixed(2)}h</p>
          </CardContent>
        </Card>
      </div>

      {rbts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Supervision Tally</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RBT</TableHead>
                  <TableHead className="text-right">Practice Hours</TableHead>
                  <TableHead className="text-right">Required (5%)</TableHead>
                  <TableHead className="text-right">Supervised</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rbts.map((rbt) => {
                  const practice = hoursByRBT[rbt.id] || 0;
                  const required = practice * 0.05;
                  const supervised = supervisedByRBT[rbt.id] || 0;
                  const remaining = Math.max(0, required - supervised);

                  return (
                    <TableRow key={rbt.id}>
                      <TableCell className="font-medium">
                        {rbt.full_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {practice > 0 ? `${practice.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {required > 0 ? `${required.toFixed(2)}h` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {supervised.toFixed(2)}h
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          practice === 0
                            ? "text-muted-foreground"
                            : remaining > 0
                            ? "text-red-600"
                            : "text-green-600"
                        )}
                      >
                        {practice === 0
                          ? "No hours entered"
                          : remaining > 0
                          ? `${remaining.toFixed(2)}h`
                          : "Met"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Link
          href="/dashboard/calendar"
          className={cn(buttonVariants(), "gap-2")}
        >
          <Calendar className="h-4 w-4" />
          Go to Calendar
        </Link>
        <Link
          href="/dashboard/hours"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <Clock className="h-4 w-4" />
          Enter Hours
        </Link>
        <Link
          href="/dashboard/reports"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <FileText className="h-4 w-4" />
          Generate Reports
        </Link>
      </div>
    </div>
  );
}
