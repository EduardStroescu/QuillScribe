import db from "@/lib/supabase/db";
import { getUser } from "@/lib/supabase/queries";
import { collaborators, files, workspaces } from "@/lib/supabase/schema";
import { and, eq, exists, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  const { folderId } = params;

  const isValid = validate(folderId);
  if (!isValid)
    return NextResponse.json(
      { data: null, error: "Incorrect folder ID." },
      { status: 400 }
    );

  const user = await getUser();
  if (!user)
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );

  try {
    const results = await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(
        and(
          eq(files.folderId, folderId),
          or(
            exists(
              db
                .select({ id: workspaces.id })
                .from(workspaces)
                .where(
                  and(
                    eq(workspaces.id, files.workspaceId),
                    eq(workspaces.workspaceOwner, user.id)
                  )
                )
            ),
            exists(
              db
                .select({ id: collaborators.id })
                .from(collaborators)
                .where(
                  and(
                    eq(collaborators.workspaceId, files.workspaceId),
                    eq(collaborators.userId, user.id)
                  )
                )
            )
          )
        )
      );

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: null, error: "Unexpected server error. Please try again later." },
      { status: 500 }
    );
  }
}
