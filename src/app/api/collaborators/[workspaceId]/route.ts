import db from "@/lib/supabase/db";
import { getUser } from "@/lib/supabase/queries";
import { collaborators } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const user = await getUser();
  if (!user)
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      }
    );

  const workspaceId = params.workspaceId;
  if (!workspaceId)
    return NextResponse.json(
      { error: "Workspace ID is required." },
      {
        status: 400,
      }
    );

  const isIdValid = validate(workspaceId);
  if (!isIdValid)
    return NextResponse.json(
      { error: "Invalid workspace ID." },
      {
        status: 400,
      }
    );

  try {
    const workspaceCollaborators = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.workspaceId, workspaceId));

    if (!workspaceCollaborators.length) return NextResponse.json([]);

    const userInformation = await Promise.all(
      workspaceCollaborators.map(async (user) => {
        return await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.id, user.userId),
        });
      })
    );

    const resolvedUsers = userInformation.filter(Boolean);

    return NextResponse.json(resolvedUsers);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later!" },
      {
        status: 500,
      }
    );
  }
}
