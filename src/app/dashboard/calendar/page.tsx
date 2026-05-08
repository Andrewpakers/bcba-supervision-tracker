import { createClient } from "@/lib/supabase/server";
import { CalendarWrapper } from "./calendar-wrapper";

export default async function CalendarPage() {
  const supabase = await createClient();

  const [sessionsResult, rbtsResult, clientsResult] = await Promise.all([
    supabase
      .from("supervision_sessions")
      .select("*, rbts(full_name), clients(full_name)")
      .order("session_date", { ascending: true }),
    supabase.from("rbts").select("*").eq("is_active", true).order("full_name"),
    supabase.from("clients").select("*").eq("is_active", true).order("full_name"),
  ]);

  return (
    <CalendarWrapper
      initialSessions={sessionsResult.data || []}
      rbts={rbtsResult.data || []}
      clients={clientsResult.data || []}
    />
  );
}
