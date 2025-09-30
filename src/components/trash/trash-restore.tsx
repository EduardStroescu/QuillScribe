"use client";

import { FileIcon, FolderIcon, Trash, Undo } from "lucide-react";
import Link from "next/link";
import { toast } from "../ui/use-toast";
import {
  deleteFile,
  deleteFolder,
  updateFile,
  updateFolder,
} from "@/lib/supabase/actions";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import {
  selectWorkspaceById,
  useAppStore,
  useAppStoreActions,
} from "@/lib/stores/app-store";
import { useShallow } from "zustand/react/shallow";
import { useMemo } from "react";

const TrashRestore = () => {
  const { workspaceId, folderId, fileId } = useParams<{
    workspaceId?: string;
    folderId?: string;
    fileId?: string;
  }>();
  const router = useRouter();
  const {
    addFile: addStateFile,
    updateFile: updateStateFile,
    deleteFile: deleteStateFile,
    addFolder: addStateFolder,
    updateFolder: updateStateFolder,
    deleteFolder: deleteStateFolder,
  } = useAppStoreActions();

  const workspace = useAppStore(useShallow(selectWorkspaceById(workspaceId)));

  const trashedFolders = useMemo(
    () => workspace?.folders.filter((f) => f.inTrash) ?? [],
    [workspace?.folders]
  );

  const trashedFiles = useMemo(
    () =>
      workspace?.folders.flatMap((f) =>
        f.files.filter((file) => file.inTrash)
      ) ?? [],
    [workspace?.folders]
  );

  const restoreFileHandler = async (
    dirType: string,
    folderId: string,
    fileId?: string
  ) => {
    if (dirType === "file") {
      if (!folderId || !workspaceId || !fileId) return;
      const currFile = trashedFiles.find((file) => file.id === fileId);
      updateStateFile(workspaceId, folderId, fileId, { inTrash: null });
      const updateResponse = await updateFile(
        {
          inTrash: null,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        fileId
      );
      if (currFile && updateResponse.error) {
        updateStateFile(workspaceId, folderId, fileId, {
          inTrash: currFile.inTrash,
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: updateResponse.error,
        });
      }
    }
    if (dirType === "folder") {
      if (!workspaceId || !folderId) return;
      const currFolder = trashedFolders.find(
        (folder) => folder.id === folderId
      );
      updateStateFolder(workspaceId, folderId, { inTrash: null });
      const updateResponse = await updateFolder(
        {
          inTrash: null,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        folderId
      );
      if (currFolder && updateResponse.error) {
        updateStateFolder(workspaceId, folderId, {
          inTrash: currFolder.inTrash,
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: updateResponse.error,
        });
      }
    }
  };

  const deleteFileHandler = async (
    dirType: string,
    deleteFolderId: string,
    deleteFileId?: string
  ) => {
    if (dirType === "file") {
      if (!deleteFolderId || !workspaceId || !deleteFileId) return;
      const currFile = trashedFiles.find((file) => file.id === deleteFileId);
      deleteStateFile(workspaceId, deleteFolderId, deleteFileId);
      const deleteResponse = await deleteFile(deleteFileId);
      if (currFile && deleteResponse.error) {
        addStateFile(workspaceId, deleteFolderId, currFile);
        toast({
          variant: "destructive",
          title: "Error",
          description: deleteResponse.error,
        });
        return;
      }

      if (fileId && fileId === deleteFileId) {
        if (folderId) {
          return router.replace(`/dashboard/${workspaceId}/${folderId}`);
        }
        return router.replace(`/dashboard/${workspaceId}`);
      }
    }

    if (dirType === "folder") {
      if (!workspaceId) return;
      const currFolder = trashedFolders.find(
        (folder) => folder.id === deleteFolderId
      );
      deleteStateFolder(workspaceId, deleteFolderId);
      const deleteResponse = await deleteFolder(deleteFolderId);
      if (currFolder && deleteResponse.error) {
        addStateFolder(workspaceId, currFolder);
        toast({
          variant: "destructive",
          title: "Error",
          description: deleteResponse.error,
        });
        return;
      }
      if (folderId && folderId === deleteFolderId) {
        return router.replace(`/dashboard/${workspaceId}`);
      }
    }
  };

  return (
    <section className="flex flex-col gap-2">
      {!!trashedFolders.length && (
        <>
          <h3>Folders</h3>
          <ul>
            {trashedFolders.map((folder) => (
              <li
                key={folder.id}
                className="rounded-md py-1 px-2 flex items-center w-full hover:border-muted border-transparent border-[1px] transition-colors"
              >
                <div className="flex flex-row w-full">
                  <Link
                    href={`/dashboard/${folder.workspaceId}/${folder.id}`}
                    className="flex-1 hover:text-accent-foreground flex items-center gap-2"
                  >
                    <FolderIcon />
                    {folder.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => restoreFileHandler("folder", folder.id)}
                      size="sm"
                      variant="ghost"
                      className="hover:dark:text-white dark:text-Neutrals/neutrals-9"
                    >
                      <Undo size={15} />
                    </Button>
                    <Button
                      onClick={() => deleteFileHandler("folder", folder.id)}
                      size="sm"
                      variant="ghost"
                      className="hover:dark:text-white dark:text-Neutrals/neutrals-9"
                    >
                      <Trash size={15} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {!!trashedFiles.length && (
        <>
          <h3>Files</h3>
          <ul>
            {trashedFiles.map((file) => (
              <li
                key={file.id}
                className="rounded-md py-1 px-2 flex items-center w-full hover:border-muted border-transparent border-[1px] transition-colors"
              >
                <div className="flex flex-row w-full">
                  <Link
                    href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
                    className="flex-1 hover:text-accent-foreground flex items-center gap-2"
                  >
                    <FileIcon />
                    {file.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        restoreFileHandler("file", file.folderId, file.id)
                      }
                      size="sm"
                      variant="ghost"
                      className="hover:dark:text-white dark:text-Neutrals/neutrals-9"
                    >
                      <Undo size={15} />
                    </Button>
                    <Button
                      onClick={() =>
                        deleteFileHandler("file", file.folderId, file.id)
                      }
                      size="sm"
                      variant="ghost"
                      className="hover:dark:text-white dark:text-Neutrals/neutrals-9"
                    >
                      <Trash size={15} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {!trashedFiles.length && !trashedFolders.length && (
        <div className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          No Items in trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
