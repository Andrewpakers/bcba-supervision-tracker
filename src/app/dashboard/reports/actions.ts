"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchReportData(rbtId: string, month: number, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const [profileResult, rbtResult, sessionsResult, hoursResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("rbts").select("*").eq("id", rbtId).single(),
    supabase
      .from("supervision_sessions")
      .select("*, clients(full_name)")
      .eq("rbt_id", rbtId)
      .gte("session_date", startDate)
      .lt("session_date", endDate)
      .order("session_date", { ascending: true }),
    supabase
      .from("monthly_hours")
      .select("*")
      .eq("rbt_id", rbtId)
      .eq("month", month)
      .eq("year", year)
      .single(),
  ]);

  return {
    profile: profileResult.data,
    rbt: rbtResult.data,
    sessions: sessionsResult.data || [],
    monthlyHours: hoursResult.data,
  };
}
