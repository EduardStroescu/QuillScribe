import { useMemo } from "react";
import { findFileById, findFolderById, findWorkspaceById } from "../utils";
import { useAppState } from "../providers/state-provider";
import { File, Folder, workspace } from "../supabase/supabase.types";

interface useDirectoryDetails {
  dirDetails: File | Folder | workspace;
  fileId: string;
  dirType: "workspace" | "folder" | "file";
}

export function useDirectoryDetails({
  dirType,
  dirDetails,
  fileId,
}: useDirectoryDetails) {
  const { state, workspaceId, folderId } = useAppState();

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === "file") {
      selectedDir = findFileById(state, workspaceId, folderId, fileId);
    }
    if (dirType === "folder") {
      selectedDir = findFolderById(state, workspaceId, fileId);
    }
    if (dirType === "workspace") {
      selectedDir = findWorkspaceById(state, fileId);
    }

    if (selectedDir) {
      return selectedDir;
    }

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as workspace | Folder | File;
  }, [
    state,
    workspaceId,
    folderId,
    dirDetails.bannerUrl,
    dirDetails.createdAt,
    dirDetails.data,
    dirDetails.iconId,
    dirDetails.inTrash,
    dirDetails.title,
    dirType,
    fileId,
  ]);

  return details;
}
