import db from "@/lib/supabase/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { users } from "../../../../migrations/schema";
import { and, eq, ilike, not } from "drizzle-orm";
import { getUser } from "@/lib/supabase/queries";

const emailSchema = z.string({ coerce: true });

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      }
    );

  const search = req.nextUrl.searchParams.get("email")?.trim();
  const emailParse = emailSchema.safeParse(search);
  if (!emailParse.success)
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      {
        status: 400,
      }
    );

  try {
    const accounts = await db
      .select({
        id: users.id,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        and(
          ilike(users.email, `%${emailParse.data}%`),
          not(eq(users.id, user.id))
        )
      );

    return NextResponse.json(accounts);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later!" },
      {
        status: 500,
      }
    );
  }
}
