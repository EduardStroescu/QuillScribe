"use client";

import { useAppStore, useAppStoreActions } from "@/lib/stores/app-store";
import {
  type File,
  type Folder,
  type Workspace,
} from "@/lib/supabase/supabase.types";
import { memo, useEffect } from "react";

type ClientSetterProps =
  | {
      dirDetails: Workspace;
      dirDetailsType: "workspace";
      workspaceFolders: Folder[];
      files?: File[];
    }
  | {
      dirDetails: Folder;
      dirDetailsType: "folder";
      workspaceFolders?: Folder[];
      files: File[];
    }
  | {
      dirDetails: File;
      dirDetailsType: "file";
      workspaceFolders?: Folder[];
      files?: File[];
    };

export const ClientSetter = memo(function ClientSetter({
  dirDetails,
  dirDetailsType,
  workspaceFolders,
  files,
}: ClientSetterProps) {
  const { setFolders, setWorkspaces, setFiles } = useAppStoreActions();

  useEffect(() => {
    if (!dirDetails) return;
    const state = useAppStore.getState();

    const updateStateIfNeeded = <
      T extends { id: string; updatedAt: string; createdAt: string }
    >(
      collection: T[],
      newItem: T,
      shouldUpdate: (existing?: T) => boolean,
      setCollection: (updated: T[]) => void,
      sortByCreatedAt: boolean = false
    ) => {
      const existingItem = collection.find((item) => item.id === newItem.id);

      if (!shouldUpdate(existingItem)) return;

      const updated = existingItem
        ? collection.map((item) => (item.id === newItem.id ? newItem : item))
        : [...collection, newItem];

      const final = sortByCreatedAt
        ? updated.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        : updated;

      setCollection(final);
    };

    if (dirDetailsType === "workspace") {
      const updatedWorkspace = {
        ...dirDetails,
        folders: workspaceFolders
          ? workspaceFolders.map((f) => ({
              ...f,
              files:
                state.actions.findFolderById(dirDetails.id, f.id)?.files || [],
            }))
          : state.actions.findWorkspaceById(dirDetails.id)?.folders || [],
      };

      updateStateIfNeeded(
        state.workspaces,
        updatedWorkspace,
        (existing) =>
          !existing ||
          !existing.folders?.length ||
          new Date(updatedWorkspace.updatedAt) > new Date(existing.updatedAt),
        setWorkspaces
      );
    } else if (dirDetailsType === "folder") {
      const oldFolders =
        state.actions.findWorkspaceById(dirDetails.workspaceId)?.folders || [];

      const updatedFolder = {
        ...dirDetails,
        files:
          files ??
          state.actions.findFolderById(dirDetails.workspaceId, dirDetails.id)
            ?.files ??
          [],
      };

      updateStateIfNeeded(
        oldFolders,
        updatedFolder,
        (existing) =>
          !existing ||
          !existing.files?.length ||
          new Date(updatedFolder.updatedAt) > new Date(existing.updatedAt),
        (folders) => setFolders(dirDetails.workspaceId, folders),
        true // keep createdAt sorting
      );
    } else if (dirDetailsType === "file" && dirDetails.folderId) {
      const oldFiles =
        state.actions.findFolderById(
          dirDetails.workspaceId,
          dirDetails.folderId
        )?.files || [];

      updateStateIfNeeded(
        oldFiles,
        dirDetails,
        (existing) =>
          !existing ||
          new Date(dirDetails.updatedAt) > new Date(existing.updatedAt),
        (files) => setFiles(dirDetails.workspaceId, dirDetails.folderId, files),
        true // keep createdAt sorting
      );
    }
  }, [
    dirDetails,
    dirDetailsType,
    files,
    setWorkspaces,
    setFolders,
    setFiles,
    workspaceFolders,
  ]);

  return null;
});
