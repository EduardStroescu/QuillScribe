import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { useAppState } from "../providers/state-provider";

import { File, workspace } from "../supabase/supabase.types";
import { Folder } from "../supabase/supabase.types";
import { useRouter } from "next/navigation";
import { findFileById, findFolderById, findWorkspaceById } from "../utils";

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient();
  const { dispatch, state, workspaceId: selectedWorskpace } = useAppState();
  const router = useRouter();
  useEffect(() => {
    const fileSubscribe = supabase
      .channel("file-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "files" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const {
              folder_id: folderId,
              workspace_id: workspaceId,
              id: fileId,
            } = payload.new;
            if (!findFileById(state, workspaceId, folderId, fileId)) {
              const newFile: File = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                folderId: payload.new.folder_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              };
              dispatch({
                type: "ADD_FILE",
                payload: { file: newFile, folderId, workspaceId },
              });
            }
          } else if (payload.eventType === "DELETE") {
            let workspaceId = "";
            let folderId = "";
            const fileExists = state.workspaces.some((workspace) =>
              workspace.folders.some((folder) =>
                folder.files.some((file) => {
                  if (file.id === payload.old.id) {
                    workspaceId = workspace.id;
                    folderId = folder.id;
                    return true;
                  }
                })
              )
            );
            if (fileExists && workspaceId && folderId) {
              router.replace(`/dashboard/${workspaceId}`);
              dispatch({
                type: "DELETE_FILE",
                payload: { fileId: payload.old.id, folderId, workspaceId },
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { folder_id: folderId, workspace_id: workspaceId } =
              payload.new;
            state.workspaces.some((workspace) =>
              workspace.folders.some((folder) =>
                folder.files.some((file) => {
                  if (file.id === payload.new.id) {
                    dispatch({
                      type: "UPDATE_FILE",
                      payload: {
                        workspaceId,
                        folderId,
                        fileId: payload.new.id,
                        file: {
                          title: payload.new.title,
                          iconId: payload.new.icon_id,
                          inTrash: payload.new.in_trash,
                        },
                      },
                    });
                    return true;
                  }
                })
              )
            );
          }
        }
      )
      .subscribe();

    const folderSubscribe = supabase
      .channel("folder-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { id: folderId, workspace_id: workspaceId } = payload.new;
            if (!findFolderById(state, workspaceId, folderId)) {
              const newFolder: Folder = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              };
              dispatch({
                type: "ADD_FOLDER",
                payload: { workspaceId, folder: { ...newFolder, files: [] } },
              });
            }
          } else if (payload.eventType === "DELETE") {
            let workspaceId = "";
            let folderId = "";
            const folderExists = state.workspaces.some((workspace) =>
              workspace.folders.some((folder) => {
                if (folder.id === payload.old.id) {
                  workspaceId = workspace.id;
                  folderId = folder.id;
                  return true;
                }
              })
            );
            if (folderExists && workspaceId && folderId) {
              router.replace(`/dashboard/${workspaceId}`);
              dispatch({
                type: "DELETE_FOLDER",
                payload: { folderId: payload.old.id, workspaceId },
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { workspace_id: workspaceId } = payload.new;
            state.workspaces.some((workspace) =>
              workspace.folders.some((folder) => {
                if (folder.id === payload.new.id) {
                  dispatch({
                    type: "UPDATE_FOLDER",
                    payload: {
                      folder: {
                        title: payload.new.title,
                        iconId: payload.new.icon_id,
                        inTrash: payload.new.in_trash,
                        bannerUrl: payload.new.banner_url,
                      },
                      workspaceId,
                      folderId: payload.new.id,
                    },
                  });
                  return true;
                }
              })
            );
          }
        }
      )
      .subscribe();

    const workspaceSubscribe = supabase
      .channel("workspace-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspaces" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { id: workspaceId } = payload.new;
            if (!findWorkspaceById(state, workspaceId)) {
              const newWorkspace: workspace = {
                id: payload.new.id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
                workspaceOwner: payload.new.workspace_owner,
                logo: payload.new.logo,
              };
              dispatch({
                type: "ADD_WORKSPACE",
                payload: { ...newWorkspace, folders: [] },
              });
              router.refresh();
            }
          } else if (payload.eventType === "DELETE") {
            let workspaceId = "";
            const workspaceExists = state.workspaces.some((workspace) => {
              if (workspace.id === payload.old.id) {
                workspaceId = workspace.id;
                return true;
              }
            });
            if (workspaceExists && workspaceId) {
              router.replace(`/dashboard`);
              dispatch({
                type: "DELETE_WORKSPACE",
                payload: workspaceId,
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { ...newWorkspace } = payload.new;
            state.workspaces.some((workspace) => {
              if (workspace.id === payload.new.id) {
                dispatch({
                  type: "UPDATE_WORKSPACE",
                  payload: {
                    workspaceId: payload.new.id,
                    workspace: { ...newWorkspace },
                  },
                });
                return true;
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      fileSubscribe.unsubscribe();
      folderSubscribe.unsubscribe();
      workspaceSubscribe.unsubscribe();
    };
  }, [supabase, state, selectedWorskpace, dispatch, router]);
};

export default useSupabaseRealtime;
