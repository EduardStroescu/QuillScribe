import "server-only";

import { validate } from "uuid";
import { files, folders, users, workspaces } from "../../../migrations/schema";
import db from "./db";
import { type Folder, type Subscription } from "./supabase.types";
import { and, eq, exists, or } from "drizzle-orm";
import { collaborators } from "./schema";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";

export const getUser = cache(async () => {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    return null;
  }
});

export const getUserSubscriptionStatus = async () => {
  const user = await getUser();
  try {
    if (!user) throw new Error("Unauthorized.");

    const subscriptionData = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, user.id),
    });
    if (subscriptionData) {
      return { data: subscriptionData as Subscription, error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: `Could not verify subscription status. Please try again later!`,
    };
  }
};

export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Invalid folder ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const results: Folder[] = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.workspaceId, workspaceId),
          or(
            // user is the owner of the workspace
            exists(
              db
                .select({ id: workspaces.id })
                .from(workspaces)
                .where(
                  and(
                    eq(workspaces.id, workspaceId),
                    eq(workspaces.workspaceOwner, user.id)
                  )
                )
            ),
            // user is a collaborator on the workspace
            exists(
              db
                .select({ id: collaborators.id })
                .from(collaborators)
                .where(
                  and(
                    eq(collaborators.workspaceId, workspaceId),
                    eq(collaborators.userId, user.id)
                  )
                )
            )
          )
        )
      )
      .orderBy(folders.createdAt);

    return { data: results, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        "Unexpected server error fetching folders. Please try again later!",
    };
  }
};

export const getWorkspaceDetails = async (workspaceId: string) => {
  const user = await getUser();
  const userId = user?.id;
  if (!userId) return { data: null, error: "Unauthorized" };

  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Invalid workspace ID" };

  try {
    const workspace = await db
      .select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, workspaceId),
          or(
            eq(workspaces.workspaceOwner, userId),
            exists(
              db
                .select({ id: collaborators.id })
                .from(collaborators)
                .where(
                  and(
                    eq(collaborators.workspaceId, workspaceId),
                    eq(collaborators.userId, userId)
                  )
                )
            )
          )
        )
      )
      .limit(1);

    if (!workspace.length)
      return {
        data: null,
        error: "Workspace not found or unauthorized to see it.",
      };

    return { data: workspace, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        "Unexpected server error fetching workspace. Please try again later!",
    };
  }
};

export const getFileDetails = async (fileId: string) => {
  const isValid = validate(fileId);
  if (!isValid) return { data: null, error: "Invalid file ID" };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const response = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.id, fileId),
          exists(
            db
              .select({ id: workspaces.id })
              .from(workspaces)
              .where(
                and(
                  eq(workspaces.id, files.workspaceId),
                  or(
                    eq(workspaces.workspaceOwner, user.id),
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
              )
          )
        )
      );

    if (!response.length)
      return {
        data: null,
        error: "File not found or unauthorized to see it.",
      };

    return { data: response, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Unexpected server error fetching file. Please try again later!",
    };
  }
};

export const getFolderDetails = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Incorrect folder ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const response = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.id, folderId),
          or(
            exists(
              db
                .select({ id: workspaces.id })
                .from(workspaces)
                .where(
                  and(
                    eq(workspaces.id, folders.workspaceId),
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
                    eq(collaborators.workspaceId, folders.workspaceId),
                    eq(collaborators.userId, user.id)
                  )
                )
            )
          )
        )
      )
      .limit(1);

    if (!response.length)
      return {
        data: null,
        error: "Folder not found or unauthorized to see it.",
      };

    return { data: response, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Unexpected server error fetching folder. Please try again later!",
    };
  }
};

export const getAllUserWorkspaces = async () => {
  const user = await getUser();
  const userId = user?.id;
  if (!userId)
    return {
      privateWorkspaces: [],
      sharedWorkspaces: [],
      collaboratingWorkspaces: [],
    };

  // Fetch all workspaces where user is owner or collaborator
  const workspacesData = await db
    .selectDistinctOn([workspaces.id], {
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
      lastModifiedBy: workspaces.lastModifiedBy,
      collaboratorId: collaborators.userId, // will be null if no collaborator
    })
    .from(workspaces)
    .leftJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .leftJoin(users, eq(collaborators.userId, users.id))
    .where(or(eq(workspaces.workspaceOwner, userId), eq(users.id, userId)))
    .orderBy(workspaces.id, workspaces.createdAt);

  // Split into the three categories
  const privateWorkspaces = workspacesData.filter(
    (w) => w.workspaceOwner === userId && !w.collaboratorId
  );
  const sharedWorkspaces = workspacesData.filter(
    (w) => w.workspaceOwner === userId && w.collaboratorId
  );
  const collaboratingWorkspaces = workspacesData.filter(
    (w) => w.workspaceOwner !== userId && w.collaboratorId
  );

  return { privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces };
};

export const getOriginalWorkspace = async () => {
  const user = await getUser();
  if (!user) return;

  try {
    return await db.query.workspaces.findFirst({
      where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
    });
  } catch {
    return;
  }
};

export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Incorrect folder ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

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

    return { data: results, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Unexpected server error fetching files. Please try again later!",
    };
  }
};

export const getActiveProductsWithPrice = async () => {
  try {
    const res = await db.query.products.findMany({
      where: (pro, { eq }) => eq(pro.active, true),
      with: {
        prices: {
          where: (pri, { eq }) => eq(pri.active, true),
        },
      },
    });
    if (res.length) return { data: res, error: null };
    return { data: [], error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error };
  }
};

export const findUser = async (userId: string) => {
  try {
    const response = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });
    return response;
  } catch {
    return;
  }
};
