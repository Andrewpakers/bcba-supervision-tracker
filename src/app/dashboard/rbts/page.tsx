import { createClient } from "@/lib/supabase/server";
import { RBTList } from "./rbt-list";

export default async function RBTsPage() {
  const supabase = await createClient();
  const { data: rbts } = await supabase
    .from("rbts")
    .select("*")
    .order("full_name");

  return <RBTList rbts={rbts || []} />;
}
