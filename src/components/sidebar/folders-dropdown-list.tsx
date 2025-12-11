"use client";

import { type File, type Folder } from "@/lib/supabase/supabase.types";
import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { v4 as uuid } from "uuid";
import { createFolder } from "@/lib/supabase/actions";
import { toast } from "../ui/use-toast";
import Dropdown from "./dropdown";
import useSupabaseRealtime from "@/lib/hooks/useSupabaseRealtime";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";
import { useParams } from "next/navigation";
import {
  type appFoldersType,
  selectWorkspaceById,
  useAppStore,
  useAppStoreActions,
} from "@/lib/stores/app-store";
import { useShallow } from "zustand/react/shallow";

const FoldersDropdownListSkeleton = dynamic(
  () => import("./folders-dropdown-list-placeholder")
);

const FoldersDropdownList = () => {
  const { subscription } = useSupabaseUser();
  const { workspaceId, folderId, fileId } = useParams<{
    workspaceId?: string;
    folderId?: string;
    fileId?: string;
  }>();
  const {
    addFolder: addStateFolder,
    deleteFolder: deleteStateFolder,
    setFiles: setStateFiles,
  } = useAppStoreActions();
  const { setOpen } = useSubscriptionModal();
  useSupabaseRealtime();

  const workspace = useAppStore(useShallow(selectWorkspaceById(workspaceId)));

  const folders = useMemo(
    () => workspace?.folders?.filter((folder) => !folder.inTrash) ?? null,
    [workspace?.folders]
  );

  // add folder
  const addFolderHandler = async () => {
    if (folders && folders.length >= 3 && !subscription) {
      setOpen(true);
      return;
    }
    if (!workspace?.id) return;
    const newFolder: Folder = {
      data: null,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: "Untitled",
      iconId: "📄",
      inTrash: null,
      workspaceId: workspace.id,
      bannerUrl: null,
      lastModifiedBy: useAppStore.getState().currentClientMutationId,
    };
    addStateFolder(workspace.id, { ...newFolder, files: [] });
    const { error } = await createFolder(newFolder);
    if (error) {
      deleteStateFolder(workspace.id, newFolder.id);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create the folder",
      });
      return;
    }
    toast({
      title: "Success",
      description: "Created folder.",
    });
  };

  // Preload folder files on hover and on click if they are not already loaded
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isPreloadingFilesFolderId, setIsPreloadingFilesFolderId] = useState<
    Folder["id"] | null
  >(null);
  const handlePreloadFiles = useCallback(
    async (folder: appFoldersType) => {
      if (
        !folder.id ||
        !folder.workspaceId ||
        isPreloadingFilesFolderId === folder.id ||
        folder.files.length
      )
        return;

      if (abortControllerRef.current) abortControllerRef.current.abort();

      setIsPreloadingFilesFolderId(folder.id);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(`/api/folders/${folder.id}/files`, {
          signal: controller.signal,
        });
        const { data: files } = (await res.json()) as
          | { data: File[]; error: null }
          | { data: null; error: string };
        if (files) {
          setStateFiles(folder.workspaceId, folder.id, files);
        }
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          // Do Nothing
        }
      } finally {
        setIsPreloadingFilesFolderId(null);
        abortControllerRef.current = null;
      }
    },
    [isPreloadingFilesFolderId, setStateFiles]
  );

  if (!folders) return <FoldersDropdownListSkeleton />;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="justify-between">
        FOLDERS
        <TooltipComponent
          message="Create Folder"
          onClick={addFolderHandler}
          aria-label="Create Folder"
          disabled={!workspace?.id}
          className="outline-none ring-sidebar-ring focus-visible:ring-2 rounded-full"
        >
          <PlusIcon size={16} />
        </TooltipComponent>
      </SidebarGroupLabel>
      <SidebarMenu>
        {folders.map((folder) => (
          <Dropdown
            key={folder.id}
            itemType="folder"
            content={folder}
            handlePreloadFiles={() => handlePreloadFiles(folder)}
            isActive={folder.id === folderId}
          >
            {folder.files
              .filter((file) => !file.inTrash)
              .map((file) => (
                <Dropdown
                  key={file.id}
                  itemType="file"
                  content={file}
                  isActive={file.id === fileId}
                />
              ))}
          </Dropdown>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default FoldersDropdownList;
