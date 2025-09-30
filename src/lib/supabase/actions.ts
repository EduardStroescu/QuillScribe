"use server";

import { validate } from "uuid";
import { files, folders, users, workspaces } from "../../../migrations/schema";
import db from "./db";
import {
  type Collaborator,
  type File,
  type Folder,
  type NewFile,
  type NewFolder,
  type NewWorkspace,
  type UpdateFile,
  type UpdateFolder,
  type UpdateUser,
  type UpdateWorkspace,
  type Workspace,
} from "./supabase.types";
import { and, eq, exists, inArray, or } from "drizzle-orm";
import { collaborators } from "./schema";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUser } from "./queries";

export const createWorkspace = async (
  workspace: Omit<NewWorkspace, "workspaceOwner">,
  collaboratorsToAdd?: string[]
): Promise<
  { data: Workspace; error: null } | { data: null; error: string }
> => {
  if (!workspace) return { data: null, error: "Invalid workspace" };
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };
  try {
    const result = await db.transaction(async (tx) => {
      // STEP 1: Insert workspace
      const [newWorkspace] = await tx
        .insert(workspaces)
        .values({ ...workspace, workspaceOwner: user.id })
        .returning();

      if (!newWorkspace) {
        tx.rollback();
        return null;
      }

      // STEP 2: Insert collaborators (skip owner)
      if (collaboratorsToAdd) {
        const collaboratorIds = collaboratorsToAdd.filter(
          (id) => id !== user.id
        ); // exclude owner

        if (collaboratorIds.length > 0) {
          await tx
            .insert(collaborators)
            .values(
              collaboratorIds.map((id) => ({
                workspaceId: newWorkspace.id,
                userId: id,
              }))
            )
            .onConflictDoNothing({
              target: [collaborators.workspaceId, collaborators.userId],
            }); // avoid duplicates
        }
      }

      return newWorkspace;
    });

    if (!result) {
      return {
        data: null,
        error: "Could not create workspace or add collaborators.",
      };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error:
        "Something went wrong and we couldn't create your workspace. Try again or come back later.",
    };
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Invalid workspace ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    // Folder & File removal is done at the db level because of onDelete cascade
    const result = await db.transaction(async (tx) => {
      // Step 1: Select folders/files before delete
      const deletedFolders = await tx
        .select()
        .from(folders)
        .where(eq(folders.workspaceId, workspaceId));

      const deletedFiles = await tx
        .select()
        .from(files)
        .where(eq(files.workspaceId, workspaceId));

      // Step 2: Delete workspace
      const [deletedWorkspace] = await tx
        .delete(workspaces)
        .where(
          and(
            eq(workspaces.id, workspaceId),
            eq(workspaces.workspaceOwner, user.id)
          )
        )
        .returning();

      if (!deletedWorkspace) {
        tx.rollback();
        return null;
      }

      return { deletedWorkspace, deletedFolders, deletedFiles };
    });

    if (!result) {
      return { data: null, error: "Only the workspace's owner can delete it." };
    }

    // Step 4: Cleanup banners
    const supabase = createServerComponentClient({ cookies });

    const bannersToDelete: (Workspace | Folder | File)[] = [
      ...result.deletedFiles.filter((f) => !!f.bannerUrl),
      ...result.deletedFolders.filter((f) => !!f.bannerUrl),
    ];
    if (result.deletedWorkspace.bannerUrl) {
      bannersToDelete.push(result.deletedWorkspace);
    }

    if (bannersToDelete.length > 0) {
      try {
        await supabase.storage
          .from("file-banners")
          .remove(bannersToDelete.map((f) => `banner-${f.id}`));
      } catch (err) {
        console.error("Banner cleanup failed:", err);
      }
    }

    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Could not delete workspace. Please try again later.",
    };
  }
};

export const deleteFile = async (fileId: string) => {
  const isValid = validate(fileId);
  if (!isValid) return { data: null, error: "Invalid file ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const [deletedFile] = await db
      .delete(files)
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
      )
      .returning();

    if (!deletedFile)
      return {
        data: null,
        error: "File not found or unauthorized to delete it.",
      };

    if (deletedFile.bannerUrl) {
      // After deleting the file, remove its banner
      const supabase = createServerComponentClient({ cookies });
      try {
        await supabase.storage
          .from("file-banners")
          .remove([`banner-${fileId}`]);
      } catch (error) {
        console.error("Banner cleanup failed:", error);
      }
    }

    return { data: null, error: null };
  } catch {
    return {
      data: null,
      error: "Could not delete the file. Please try again later.",
    };
  }
};

export const deleteFolder = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Invalid folder ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    // File removal is done at the db level because of onDelete cascade
    const result = await db.transaction(async (tx) => {
      // STEP 1: Select files inside folder
      const deletedFiles = await tx
        .select()
        .from(files)
        .where(eq(files.folderId, folderId));

      // STEP 2: Remove folder
      const [deletedFolder] = await tx
        .delete(folders)
        .where(
          and(
            eq(folders.id, folderId),
            exists(
              tx
                .select({ id: workspaces.id })
                .from(workspaces)
                .where(
                  and(
                    eq(workspaces.id, folders.workspaceId),
                    or(
                      eq(workspaces.workspaceOwner, user.id),
                      exists(
                        tx
                          .select({ id: collaborators.id })
                          .from(collaborators)
                          .where(
                            and(
                              eq(
                                collaborators.workspaceId,
                                folders.workspaceId
                              ),
                              eq(collaborators.userId, user.id)
                            )
                          )
                      )
                    )
                  )
                )
            )
          )
        )
        .returning();

      if (!deletedFolder) {
        tx.rollback();
        return null;
      }

      return { deletedFolder, deletedFiles };
    });

    if (!result) {
      return {
        data: null,
        error: "Folder not found or unauthorized to delete it.",
      };
    }

    // Cleanup banners
    const supabase = createServerComponentClient({ cookies });
    const bannersToDelete: (Folder | File)[] = [
      ...result.deletedFiles.filter((f) => !!f.bannerUrl),
    ];
    if (result.deletedFolder.bannerUrl) {
      bannersToDelete.push(result.deletedFolder);
    }

    if (bannersToDelete.length > 0) {
      try {
        await supabase.storage
          .from("file-banners")
          .remove(bannersToDelete.map((f) => `banner-${f.id}`));
      } catch (err) {
        console.error("Banner cleanup failed:", err);
      }
    }

    return { data: null, error: null };
  } catch (e) {
    return {
      data: null,
      error: "Could not delete folder. Please try again later!",
    };
  }
};

export const addCollaborators = async (
  users: Collaborator[],
  workspaceId: string
) => {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Incorrect workspace ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  if (!users.length) return { data: null, error: "No users provided" };

  try {
    const result = await db.transaction(async (tx) => {
      // STEP 1: Get workspace info
      const [workspace] = await tx
        .select({ workspaceOwner: workspaces.workspaceOwner })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));

      if (!workspace) return null;

      // STEP 2: Check if current user is owner or collaborator
      const isAllowed =
        workspace.workspaceOwner === user.id ||
        (
          await tx
            .select()
            .from(collaborators)
            .where(
              and(
                eq(collaborators.workspaceId, workspaceId),
                eq(collaborators.userId, user.id)
              )
            )
        ).length > 0;

      if (!isAllowed) return null;

      // STEP 3: Filter out workspace owner and duplicates
      const filteredUsers = users
        .filter((u) => u.id !== workspace.workspaceOwner)
        .map((u) => ({ workspaceId, userId: u.id }));

      if (filteredUsers.length === 0) return [];

      // STEP 4: Batch insert with onConflictDoNothing
      await tx
        .insert(collaborators)
        .values(filteredUsers)
        .onConflictDoNothing({
          target: [collaborators.workspaceId, collaborators.userId],
        });

      return filteredUsers;
    });

    if (!result) {
      return {
        data: null,
        error: "Workspace not found or unauthorized to add collaborators.",
      };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not add collaborators. Please try again later!",
    };
  }
};

export const removeCollaborators = async (
  users: Collaborator[],
  workspaceId: string
) => {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Incorrect workspace ID." };

  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const result = await db.transaction(async (tx) => {
      // STEP 1: Get workspace info
      const [workspace] = await tx
        .select({ workspaceOwner: workspaces.workspaceOwner })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));

      if (!workspace) return null;

      // STEP 2: Check if current user is owner or collaborator
      const isAllowed =
        workspace.workspaceOwner === user.id ||
        (
          await tx
            .select()
            .from(collaborators)
            .where(
              and(
                eq(collaborators.workspaceId, workspaceId),
                eq(collaborators.userId, user.id)
              )
            )
        ).length > 0;

      if (!isAllowed) return null;

      // STEP 3: Filter out workspace owner (cannot be removed)
      const userIdsToRemove = users
        .map((u) => u.id)
        .filter((id) => id !== workspace.workspaceOwner);

      if (userIdsToRemove.length === 0) return [];

      // STEP 4: Batch delete
      await tx
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            inArray(collaborators.userId, userIdsToRemove)
          )
        );

      return userIdsToRemove;
    });

    if (!result) {
      return {
        data: null,
        error: "Workspace not found or unauthorized to remove collaborators.",
      };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not remove collaborators. Please try again later!",
    };
  }
};

export const createFolder = async (folder: NewFolder) => {
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const result = await db.transaction(async (tx) => {
      // Check if user can create in this workspace
      const canCreate = await tx
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(
          and(
            eq(workspaces.id, folder.workspaceId),
            or(
              eq(workspaces.workspaceOwner, user.id),
              exists(
                tx
                  .select({ id: collaborators.id })
                  .from(collaborators)
                  .where(
                    and(
                      eq(collaborators.workspaceId, folder.workspaceId),
                      eq(collaborators.userId, user.id)
                    )
                  )
              )
            )
          )
        );

      if (!canCreate.length) {
        tx.rollback();
        return null;
      }

      // User is allowed → insert the folder
      const [newFolder] = await tx.insert(folders).values(folder).returning();

      return newFolder;
    });

    if (!result) {
      return {
        data: null,
        error: "You are not authorized to create a folder in this workspace.",
      };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not create folder. Please try again later!",
    };
  }
};

export const createFile = async (file: NewFile) => {
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const result = await db.transaction(async (tx) => {
      // Check if user is owner or collaborator
      const canCreate = await tx
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(
          and(
            eq(workspaces.id, file.workspaceId),
            or(
              eq(workspaces.workspaceOwner, user.id),
              exists(
                tx
                  .select({ id: collaborators.id })
                  .from(collaborators)
                  .where(
                    and(
                      eq(collaborators.workspaceId, file.workspaceId),
                      eq(collaborators.userId, user.id)
                    )
                  )
              )
            )
          )
        );

      if (!canCreate.length) {
        tx.rollback();
        return null;
      }

      // User is allowed → insert the file
      const [newFile] = await tx.insert(files).values(file).returning();
      return newFile;
    });

    if (!result) {
      return {
        data: null,
        error: "You are not authorized to create a file in this workspace.",
      };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not create file. Please try again later!",
    };
  }
};

export const updateFolder = async (folder: UpdateFolder, folderId: string) => {
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    const updatedFolder = await db
      .update(folders)
      .set(folder)
      .where(
        and(
          eq(folders.id, folderId),
          exists(
            db
              .select({ id: workspaces.id })
              .from(workspaces)
              .where(
                and(
                  eq(workspaces.id, folders.workspaceId),
                  or(
                    eq(workspaces.workspaceOwner, user.id),
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
          )
        )
      )
      .returning();

    if (!updatedFolder.length) {
      return {
        data: null,
        error: "Folder not found or unauthorized to update it.",
      };
    }

    if (folder.bannerUrl === null) {
      try {
        const supabase = createServerComponentClient({ cookies });
        await supabase.storage
          .from("file-banners")
          .remove([`banner-${folderId}`]);
      } catch (error) {
        console.error("Banner cleanup failed:", error);
      }
    }

    return { data: updatedFolder[0], error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not update folder. Please try again later!",
    };
  }
};

export const updateFile = async (file: UpdateFile, fileId: string) => {
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };
  try {
    const updatedFile = await db
      .update(files)
      .set(file)
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
      )
      .returning();

    if (!updatedFile.length) {
      return {
        data: null,
        error: "File not found or unauthorized to update it.",
      };
    }

    if (file.bannerUrl === null) {
      const supabase = createServerComponentClient({ cookies });
      try {
        await supabase.storage
          .from("file-banners")
          .remove([`banner-${fileId}`]);
      } catch (error) {
        console.error("Banner cleanup failed:", error);
      }
    }

    return { data: updatedFile[0], error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not update file. Please try again later!",
    };
  }
};

export const updateWorkspace = async (
  workspace: UpdateWorkspace,
  workspaceId: string
) => {
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    // Step 1: Update in DB
    const [updatedWorkspace] = await db
      .update(workspaces)
      .set(workspace)
      .where(
        and(
          eq(workspaces.id, workspaceId),
          or(
            eq(workspaces.workspaceOwner, user.id),
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
      .returning();

    if (!updatedWorkspace) {
      return {
        data: null,
        error: "Workspace not found or unauthorized to update it.",
      };
    }

    // Step 2: Storage cleanup
    const supabase = createServerComponentClient({ cookies });

    try {
      if (workspace.logo === null) {
        await supabase.storage
          .from("workspace-logos")
          .remove([`workspaceLogo.${workspaceId}`]);
      }
      if (workspace.bannerUrl === null) {
        await supabase.storage
          .from("file-banners")
          .remove([`banner-${workspaceId}`]);
      }
    } catch (storageError) {
      console.error("Banner cleanup failed:", storageError);
    }

    return { data: updatedWorkspace, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Could not update workspace. Please try again later!",
    };
  }
};

export async function updateUser(user: UpdateUser) {
  const authUser = await getUser();
  if (!authUser) return { data: null, error: "User not found" };

  try {
    // Step 1: Update DB
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, authUser.id))
      .returning();

    if (!updatedUser) {
      return {
        data: null,
        error: "Could not update user. Please try again later!",
      };
    }

    // Step 2: Handle avatar cleanup (non-blocking)
    if (user.avatarUrl === null) {
      const supabase = createServerComponentClient({ cookies });
      try {
        await supabase.storage
          .from("avatars")
          .remove([`avatar.${authUser.id}`]);
      } catch (err) {
        console.error("Failed to remove user avatar:", err);
      }
    }

    return { data: updatedUser, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Could not update user. Please try again later!",
    };
  }
}

export const transferWorkspaceOwnership = async (
  workspaceId: string,
  newOwnerId: string
) => {
  if (!validate(workspaceId)) {
    return { data: null, error: "Incorrect workspace ID." };
  }
  if (!validate(newOwnerId)) {
    return { data: null, error: "Incorrect user ID." };
  }
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  if (user.id === newOwnerId)
    return { data: null, error: "Cannot transfer to self" };

  try {
    const result = await db.transaction(async (tx) => {
      const [workspace] = await tx
        .update(workspaces)
        .set({
          workspaceOwner: newOwnerId,
        })
        .where(
          and(
            eq(workspaces.id, workspaceId),
            eq(workspaces.workspaceOwner, user.id)
          )
        )
        .returning();

      if (!workspace) {
        tx.rollback();
        return null;
      }

      await tx
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            eq(collaborators.userId, newOwnerId)
          )
        );
      await tx
        .insert(collaborators)
        .values({ workspaceId, userId: user.id })
        .onConflictDoNothing({
          target: [collaborators.workspaceId, collaborators.userId],
        });

      return workspace;
    });

    if (!result) {
      return {
        data: null,
        error: "Workspace not found or unauthorized to transfer ownership.",
      };
    }

    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Could not transfer workspace ownership. Please try again later!",
    };
  }
};
