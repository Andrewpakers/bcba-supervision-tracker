"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRBT(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("rbts").insert({
    bcba_id: user.id,
    full_name: formData.get("full_name") as string,
    certification_number: (formData.get("certification_number") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/rbts");
}

export async function updateRBT(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("rbts")
    .update({
      full_name: formData.get("full_name") as string,
      certification_number: (formData.get("certification_number") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
    })
    .eq("id", id)
    .eq("bcba_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/rbts");
}

export async function deleteRBT(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("rbts")
    .delete()
    .eq("id", id)
    .eq("bcba_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/rbts");
}
