import {
  type appFoldersType,
  type appWorkspacesType,
  selectFileById,
  selectFolderById,
  selectWorkspaceById,
  useAppStore,
} from "../stores/app-store";
import { useShallow } from "zustand/react/shallow";
import { type File } from "../supabase/supabase.types";

const EMPTY_DIR = {} as appWorkspacesType | appFoldersType | File;

type UseDirectoryDetailsParams =
  | {
      fileId: string;
      dirType: "workspace";
      workspaceId?: string;
      folderId?: string;
    }
  | {
      fileId: string;
      dirType: "folder";
      workspaceId: string;
      folderId: string;
    }
  | {
      fileId: string;
      dirType: "file";
      workspaceId: string;
      folderId: string;
    };

export function useDirectoryDetails({
  dirType,
  workspaceId,
  folderId,
  fileId,
}: UseDirectoryDetailsParams) {
  return useAppStore(
    useShallow((state) => {
      if (dirType === "workspace") {
        return selectWorkspaceById(fileId, true)(state) || EMPTY_DIR;
      }
      if (dirType === "folder") {
        return selectFolderById(workspaceId, fileId, true)(state) || EMPTY_DIR;
      }
      if (dirType === "file") {
        return (
          selectFileById(workspaceId, folderId, fileId, true)(state) ||
          EMPTY_DIR
        );
      }
      return EMPTY_DIR;
    })
  );
}
