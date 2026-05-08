import { createClient } from "@/lib/supabase/server";
import { HoursTable } from "@/components/hours/hours-table";

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function HoursPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

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

  // Aggregate supervised hours by RBT
  const supervisedByRBT: Record<string, number> = {};
  for (const s of sessions) {
    supervisedByRBT[s.rbt_id] =
      (supervisedByRBT[s.rbt_id] || 0) + Number(s.duration_hours);
  }

  // Map monthly hours by RBT
  const hoursByRBT: Record<string, number> = {};
  for (const h of monthlyHours) {
    hoursByRBT[h.rbt_id] = Number(h.total_practice_hours);
  }

  return (
    <HoursTable
      rbts={rbts}
      hoursByRBT={hoursByRBT}
      supervisedByRBT={supervisedByRBT}
      month={month}
      year={year}
    />
  );
}
