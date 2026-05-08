import { createClient } from "@/lib/supabase/server";
import { ReportGenerator } from "@/components/reports/report-generator";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: rbts } = await supabase
    .from("rbts")
    .select("*")
    .eq("is_active", true)
    .order("full_name");

  return <ReportGenerator rbts={rbts || []} />;
}
