"use server";

import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { FormSchema } from "../types";
import { cookies } from "next/headers";

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    data,
    error: error
      ? {
          message: error.message,
          name: error.name,
          status: (error as any).status,
        }
      : null,
  };
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check if user already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email);

  if (existing?.length) {
    return {
      data: null,
      error: { message: "User already exists" },
    };
  }

  // Sign up user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  return {
    data,
    error: error
      ? {
          message: error.message,
          name: error.name,
          status: (error as any).status,
        }
      : null,
  };
}
