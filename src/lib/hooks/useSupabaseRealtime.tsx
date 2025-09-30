import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

import { useAppStore, useAppStoreActions } from "../stores/app-store";
import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "../providers/supabase-user-provider";

const useSupabaseRealtime = () => {
  const { user } = useSupabaseUser();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const {
    findFileById,
    findFolderById,
    findWorkspaceById,
    addFile,
    deleteFile,
    updateFile,
    addFolder,
    deleteFolder,
    updateFolder,
    addWorkspace,
    deleteWorkspace,
    updateWorkspace,
  } = useAppStoreActions();

  useEffect(() => {
    const currentClientMutationId =
      useAppStore.getState().currentClientMutationId;

    if (!currentClientMutationId) return;

    const subscribeTable = (
      table: string,
      processInsert: (payload: RealtimePostgresInsertPayload<any>) => void,
      processUpdate: (payload: RealtimePostgresUpdatePayload<any>) => void,
      processDelete: (payload: RealtimePostgresDeletePayload<any>) => void
    ) =>
      supabase
        .channel(`${table}-changes`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            // Metadata column added to not rerender unnecessarily on mutations done by the same client
            const actor: string | null | undefined =
              (payload.new as { last_modified_by?: string | null })
                ?.last_modified_by ??
              (payload.old as { last_modified_by?: string | null })
                ?.last_modified_by;

            if (
              payload.eventType !== "DELETE" &&
              actor === currentClientMutationId
            )
              return;

            switch (payload.eventType) {
              case "INSERT":
                processInsert(payload);
                break;
              case "UPDATE":
                processUpdate(payload);
                break;
              case "DELETE":
                processDelete(payload);
                break;
            }
          }
        )
        .subscribe();

    // --- FILES ---
    const fileSub = subscribeTable(
      "files",
      ({ new: n }) => {
        const existing = findFileById(n.workspace_id, n.folder_id, n.id);
        if (existing) return;
        addFile(n.workspace_id, n.folder_id, {
          id: n.id,
          workspaceId: n.workspace_id,
          folderId: n.folder_id,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
          title: n.title,
          iconId: n.icon_id,
          data: n.data,
          inTrash: n.in_trash,
          bannerUrl: n.banner_url,
          lastModifiedBy: n.last_modified_by,
        });
      },
      ({ new: n }) => {
        const curr = findFileById(n.workspace_id, n.folder_id, n.id);
        if (!curr) return;
        updateFile(n.workspace_id, n.folder_id, n.id, {
          title: n.title,
          iconId: n.icon_id,
          inTrash: n.in_trash,
          lastModifiedBy: n.last_modified_by,
          updatedAt: n.updated_at,
        });
      },
      ({ old: o }) => {
        const curr = findFileById(o.workspace_id, o.folder_id, o.id);
        if (!curr) return;
        deleteFile(o.workspace_id, o.folder_id, o.id);
        router.refresh();
      }
    );

    // --- FOLDERS ---
    const folderSub = subscribeTable(
      "folders",
      ({ new: n }) => {
        const existing = findFolderById(n.workspace_id, n.id);
        if (existing) return;
        addFolder(n.workspace_id, {
          id: n.id,
          workspaceId: n.workspace_id,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
          title: n.title,
          iconId: n.icon_id,
          data: n.data,
          inTrash: n.in_trash,
          bannerUrl: n.banner_url,
          files: [],
          lastModifiedBy: n.last_modified_by,
        });
      },
      ({ new: n }) => {
        const curr = findFolderById(n.workspace_id, n.id);
        if (!curr) return;
        updateFolder(n.workspace_id, n.id, {
          title: n.title,
          iconId: n.icon_id,
          inTrash: n.in_trash,
          bannerUrl: n.banner_url,
          lastModifiedBy: n.last_modified_by,
          updatedAt: n.updated_at,
        });
      },
      ({ old: o }) => {
        const curr = findFolderById(o.workspace_id, o.id);
        if (!curr) return;
        deleteFolder(o.workspace_id, o.id);
        router.refresh();
      }
    );

    // --- WORKSPACES ---
    const workspaceSub = subscribeTable(
      "workspaces",
      ({ new: n }) => {
        const existing = findWorkspaceById(n.id);
        if (existing) return;
        addWorkspace({
          id: n.id,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
          title: n.title,
          iconId: n.icon_id,
          data: n.data,
          inTrash: n.in_trash,
          bannerUrl: n.banner_url,
          workspaceOwner: n.workspace_owner,
          logo: n.logo,
          folders: [],
          lastModifiedBy: n.last_modified_by,
        });
        router.refresh();
      },
      ({ new: n }) => {
        const curr = findWorkspaceById(n.id);
        if (!curr) return;
        updateWorkspace(n.id, {
          title: n.title,
          iconId: n.icon_id,
          data: n.data,
          inTrash: n.in_trash,
          bannerUrl: n.banner_url,
          workspaceOwner: n.workspace_owner,
          logo: n.logo,
          updatedAt: n.updated_at,
          lastModifiedBy: n.last_modified_by,
        });
      },
      ({ old: o }) => {
        const curr = findWorkspaceById(o.id);
        if (!curr) return;
        deleteWorkspace(o.id);
        router.refresh();
      }
    );

    return () => {
      fileSub.unsubscribe();
      folderSub.unsubscribe();
      workspaceSub.unsubscribe();
    };
  }, [
    router,
    supabase,
    findFileById,
    addFile,
    deleteFile,
    updateFile,
    findFolderById,
    addFolder,
    deleteFolder,
    updateFolder,
    findWorkspaceById,
    addWorkspace,
    deleteWorkspace,
    updateWorkspace,
  ]);

  useEffect(() => {
    const collaboratorsSub = supabase
      .channel(`collaborators-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collaborators" },
        (payload) => {
          const affectedUserId =
            (payload.new as { user_id?: string })?.user_id ??
            (payload.old as { user_id?: string })?.user_id;

          if (affectedUserId !== user?.id) return;

          if (payload.eventType === "INSERT") {
            const curr = findWorkspaceById(payload.new.workspace_id);
            if (!curr) router.refresh();
          } else if (payload.eventType === "DELETE") {
            const curr = findWorkspaceById(payload.old.workspace_id);
            if (curr) router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      collaboratorsSub.unsubscribe();
    };
  }, [supabase, user?.id, findWorkspaceById, router]);
};

export default useSupabaseRealtime;
