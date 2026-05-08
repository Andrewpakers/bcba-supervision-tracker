"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("clients").insert({
    bcba_id: user.id,
    full_name: formData.get("full_name") as string,
    date_of_birth: (formData.get("date_of_birth") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clients");
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("clients")
    .update({
      full_name: formData.get("full_name") as string,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id)
    .eq("bcba_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clients");
}

export async function deleteClientRecord(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("bcba_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clients");
}
