"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertMonthlyHours(
  rbtId: string,
  month: number,
  year: number,
  totalPracticeHours: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("monthly_hours").upsert(
    {
      bcba_id: user.id,
      rbt_id: rbtId,
      month,
      year,
      total_practice_hours: totalPracticeHours,
    },
    { onConflict: "rbt_id,month,year" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/hours");
  revalidatePath("/dashboard");
}
