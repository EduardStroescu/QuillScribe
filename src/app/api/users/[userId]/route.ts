import db from "@/lib/supabase/db";
import { getUser } from "@/lib/supabase/queries";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const user = await getUser();
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      }
    );

  const userId = params.userId.trim();
  if (!userId)
    return NextResponse.json(
      { error: "User ID is required." },
      {
        status: 400,
      }
    );

  const isIdValid = validate(userId);
  if (!isIdValid)
    return NextResponse.json(
      { error: "Invalid user ID." },
      {
        status: 400,
      }
    );

  try {
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later!" },
      {
        status: 500,
      }
    );
  }
}
