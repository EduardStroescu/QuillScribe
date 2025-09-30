"use client";

import {
  type ChangeEvent,
  memo,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import EmojiPicker from "../global/emoji-picker";
import { createFile, updateFile, updateFolder } from "@/lib/supabase/actions";
import { toast } from "../ui/use-toast";
import TooltipComponent from "../global/tooltip-component";
import { ChevronRight, Pencil, PlusIcon, Trash } from "lucide-react";
import { type File, type Folder } from "@/lib/supabase/supabase.types";
import { v4 as uuid } from "uuid";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import { useAppStore, useAppStoreActions } from "@/lib/stores/app-store";
import Link from "next/link";
import { Separator } from "../ui/separator";

type DropdownProps =
  | {
      isActive: boolean;
      itemType: "folder";
      content: Folder;
      handlePreloadFiles?: () => void;
      children?: React.ReactNode;
    }
  | {
      isActive: boolean;
      itemType: "file";
      content: File;
      handlePreloadFiles?: () => void;
      children?: React.ReactNode;
    };

const Dropdown: React.FC<DropdownProps> = memo(function Dropdown({
  children,
  isActive,
  itemType,
  content,
  handlePreloadFiles,
}) {
  const { user } = useSupabaseUser();
  const {
    updateFolder: updateStateFolder,
    updateFile: updateStateFile,
    addFile,
    deleteFile,
  } = useAppStoreActions();
  const [title, setTitle] = useState(content.title);
  const [isEditing, setIsEditing] = useState(false);

  // Submit Folder/File title modification
  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    if (!title) {
      setTitle(content.title);
      return;
    }
    if (title === content.title) return;
    const currTitle = content.title;
    if (itemType === "folder") {
      updateStateFolder(content.workspaceId, content.id, { title });
      const { error } = await updateFolder(
        {
          title,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        content.id
      );
      if (error) {
        updateStateFolder(content.workspaceId, content.id, {
          title: currTitle,
        });
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the title for this folder",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Folder title changed.",
      });
    }

    if (itemType === "file") {
      updateStateFile(content.workspaceId, content.folderId, content.id, {
        title,
      });
      const { error } = await updateFile(
        {
          title,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        content.id
      );
      if (error) {
        updateStateFile(content.workspaceId, content.folderId, content.id, {
          title: currTitle,
        });
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the title for this file",
        });
        return;
      }
      toast({
        title: "Success",
        description: "File title changed.",
      });
    }
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (selectedEmoji === content.iconId) return;
    const currIcon = content.iconId;
    if (itemType === "folder") {
      updateStateFolder(content.workspaceId, content.id, {
        iconId: selectedEmoji,
      });
      const { error } = await updateFolder(
        {
          iconId: selectedEmoji,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        content.id
      );
      if (error) {
        updateStateFolder(content.workspaceId, content.id, {
          iconId: currIcon,
        });
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the emoji for this folder",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Updated emoji for the folder",
      });
    }
    if (itemType === "file") {
      updateStateFile(content.workspaceId, content.folderId, content.id, {
        iconId: selectedEmoji,
      });

      const { error } = await updateFile(
        {
          iconId: selectedEmoji,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        content.id
      );
      if (error) {
        updateStateFile(content.workspaceId, content.folderId, content.id, {
          iconId: currIcon,
        });
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the emoji for this file",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Updated emoji for the file",
      });
    }
  };

  const titleChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const moveToTrash = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!user?.email) return;
    if (itemType === "folder") {
      updateStateFolder(content.workspaceId, content.id, {
        inTrash: `Deleted by ${user.email}`,
      });
      const { error } = await updateFolder(
        {
          inTrash: `Deleted by ${user?.email}`,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        content.id
      );
      if (error) {
        updateStateFolder(content.workspaceId, content.id, { inTrash: null });
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not move the folder to trash",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Moved folder to trash",
      });
    }

    if (itemType === "file") {
      updateStateFile(content.workspaceId, content.folderId, content.id, {
        inTrash: `Deleted by ${user?.email}`,
      });
      const { error } = await updateFile(
        {
          inTrash: `Deleted by ${user?.email}`,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        content.id
      );
      if (error) {
        updateStateFile(content.workspaceId, content.folderId, content.id, {
          inTrash: null,
        });
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not move the file to trash",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Moved the file to trash",
      });
    }
  };

  const addNewFile = async () => {
    const newFile: File = {
      folderId: content.id,
      data: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inTrash: null,
      title: "Untitled",
      iconId: "📄",
      id: uuid(),
      workspaceId: content.workspaceId,
      bannerUrl: null,
      lastModifiedBy: useAppStore.getState().currentClientMutationId,
    };
    addFile(content.workspaceId, content.id, newFile);
    const { error } = await createFile(newFile);
    if (error) {
      deleteFile(content.workspaceId, content.id, newFile.id);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create a file",
      });
      return;
    }
    toast({
      title: "Success",
      description: "File created.",
    });
  };

  // Sync title with state
  useEffect(() => {
    if (!isEditing) setTitle(content.title);
  }, [isEditing, content.title]);

  if (itemType === "folder")
    return (
      <SidebarMenuItem
        onMouseOver={handlePreloadFiles}
        onClick={handlePreloadFiles}
      >
        <Collapsible defaultOpen={isActive} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton asChild className="gap-1 group/folder">
              <div
                className={cn(
                  "whitespace-nowrap flex items-center w-full relative py-0",
                  {
                    "bg-sidebar-accent": isActive,
                  }
                )}
              >
                <EmojiPicker
                  getValue={onChangeEmoji}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer"
                  aria-label="Change Emoji"
                >
                  {content.iconId}
                </EmojiPicker>
                <Link
                  href={`/dashboard/${content.workspaceId}/${content.id}`}
                  className="flex-1 flex items-center h-full overflow-hidden outline-none ring-inset focus-visible:ring-2 ring-white rounded-md"
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={title}
                      autoFocus
                      onFocus={(e) => e.currentTarget.select()}
                      className="outline-none bg-transparent h-full max-w-full cursor-text"
                      onBlur={handleBlur}
                      onChange={titleChangeHandler}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur(); // save
                        }
                        if (e.key === "Escape") {
                          setTitle(content.title); // revert
                          setIsEditing(false);
                        }
                      }}
                    />
                  ) : (
                    <span className="truncate cursor-pointer">{title}</span>
                  )}
                </Link>

                <div className="flex h-full items-center w-0 group-hover/folder:w-auto group-focus-within/folder:w-auto overflow-clip">
                  {!isEditing && (
                    <>
                      <TooltipComponent
                        aria-label="Edit Title"
                        message="Edit Title"
                        className="transition-colors cursor-pointer h-full px-1 outline-none focus-visible:ring-2 ring-white ring-inset rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                      >
                        <Pencil size={15} />
                      </TooltipComponent>
                      <TooltipComponent
                        onClick={moveToTrash}
                        message="Delete Folder"
                        aria-label="Delte Folder"
                        className="transition-colors cursor-pointer h-full px-1 border-x-white border border-y-0 outline-none focus-visible:ring-2 ring-white"
                      >
                        <Trash size={15} />
                      </TooltipComponent>
                      <TooltipComponent
                        message="Add File"
                        aria-label="Add File"
                        onClick={addNewFile}
                        className="transition-colors cursor-pointer h-full px-1 outline-none focus-visible:ring-2 ring-white ring-inset rounded-md"
                      >
                        <PlusIcon size={15} />
                      </TooltipComponent>
                    </>
                  )}
                </div>
                <button className="self-center w-auto hover:bg-transparent outline-none ring-white focus-visible:ring-2 rounded-full">
                  <ChevronRight
                    size={15}
                    className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </button>
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>{children}</SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );

  return (
    <SidebarMenuSubItem className="group/file">
      <SidebarMenuSubButton asChild className="gap-1">
        <div
          className={cn(
            "whitespace-nowrap flex items-center w-full relative py-0",
            {
              "bg-sidebar-accent": isActive,
            }
          )}
        >
          <EmojiPicker
            getValue={onChangeEmoji}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer"
            aria-label="Change Emoji"
          >
            {content.iconId}
          </EmojiPicker>
          <Link
            href={`/dashboard/${content.workspaceId}/${content.folderId}/${content.id}`}
            className="flex-1 flex items-center h-full overflow-hidden outline-none ring-inset focus-visible:ring-2 ring-white rounded-md"
          >
            {isEditing ? (
              <input
                type="text"
                value={title}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                className="outline-none bg-transparent h-full max-w-full cursor-text"
                onBlur={handleBlur}
                onChange={titleChangeHandler}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur(); // save
                  }
                  if (e.key === "Escape") {
                    setTitle(content.title); // revert
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <span className="truncate cursor-pointer">{title}</span>
            )}
          </Link>
          <div className="flex h-full items-center w-0 gap-1 group-hover/file:w-auto group-focus-within/file:w-auto overflow-clip">
            <TooltipComponent
              aria-label="Edit Title"
              message="Edit Title"
              className="transition-colors cursor-pointer h-full px-1 outline-none focus-visible:ring-2 ring-white ring-inset rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Pencil size={15} />
            </TooltipComponent>
            <Separator orientation="vertical" className="bg-white" />
            <TooltipComponent
              onClick={moveToTrash}
              message="Delete File"
              aria-label="Delte File"
              className="transition-colors cursor-pointer h-full px-1 outline-none focus-visible:ring-2 ring-white ring-inset rounded-md"
            >
              <Trash size={15} />
            </TooltipComponent>
          </div>
        </div>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
});

export default Dropdown;
