"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSession(data: {
  rbt_id: string;
  client_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (data.end_time <= data.start_time) {
    throw new Error("End time must be after start time");
  }

  const { error } = await supabase.from("supervision_sessions").insert({
    bcba_id: user.id,
    ...data,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/hours");
}

export async function updateSession(
  id: string,
  data: {
    rbt_id?: string;
    client_id?: string;
    session_date?: string;
    start_time?: string;
    end_time?: string;
    notes?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (data.start_time && data.end_time && data.end_time <= data.start_time) {
    throw new Error("End time must be after start time");
  }

  const { error } = await supabase
    .from("supervision_sessions")
    .update(data)
    .eq("id", id)
    .eq("bcba_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/hours");
}

export async function deleteSession(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("supervision_sessions")
    .delete()
    .eq("id", id)
    .eq("bcba_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/hours");
}
