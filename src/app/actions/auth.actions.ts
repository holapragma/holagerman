"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: unknown) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false as const,
      error: { _form: ["Email o contraseña incorrectos"] },
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
