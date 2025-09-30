"use client";

import "quill/dist/quill.snow.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/actions";
import Image from "next/image";
import EmojiPicker from "../global/emoji-picker";
import BannerUpload from "../banner-upload/banner-upload";
import { Plus, XCircleIcon } from "lucide-react";
import { TOOLBAR_OPTIONS } from "@/lib/const/quillToolbarOptions";
import { toast } from "../ui/use-toast";
import { useQuillContext } from "@/lib/providers/quill-editor-provider";
import {
  type appFoldersType,
  type appWorkspacesType,
  useAppStore,
  useAppStoreActions,
} from "@/lib/stores/app-store";
import QuillTrashBanner, { QuillTrashBannerProps } from "./quill-trash-banner";
import { useInitialQuillContent } from "@/lib/hooks/useInitialQuillContent";
import TooltipComponent from "../global/tooltip-component";
import { getSupabaseImageUrl, isFile, isFolder } from "@/lib/utils";
import { type File } from "@/lib/supabase/supabase.types";

const QuillEditor = () => {
  const { quill, setQuill, dirDetails, dirType, fileId } = useQuillContext();
  const {
    updateFile: updateStateFile,
    updateFolder: updateStateFolder,
    updateWorkspace: updateStateWorkspace,
  } = useAppStoreActions();
  const [deletingBanner, setDeletingBanner] = useState(false);

  // Quill Initialisation
  const quillWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const quillWrapper = quillWrapperRef.current;
    if (!quillWrapper || typeof window === "undefined") return;

    const init = async () => {
      quillWrapper.innerHTML = "";
      const editor = document.createElement("div");
      quillWrapper.append(editor);
      const Quill = (await import("quill")).default;
      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors, true);

      const q = new Quill(editor, {
        theme: "snow",
        bounds: editor,
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    };

    init();

    return () => {
      setQuill(null);
    };
  }, [setQuill]);

  // Sync initial quill content
  useInitialQuillContent({ quill, dirDetails });

  const iconOnChange = async (icon: string) => {
    if (!dirDetails) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update icon. Please try again later!",
      });
      return;
    }
    if (icon === dirDetails.iconId) return;

    const curr = dirDetails;

    // Map dirType → handler
    const handlers: Record<
      typeof dirType,
      (() => Promise<{ error: string | null }>) | undefined
    > = {
      workspace: async () => {
        updateStateWorkspace(curr.id, { iconId: icon });
        const { error } = await updateWorkspace(
          {
            iconId: icon,
            lastModifiedBy: useAppStore.getState().currentClientMutationId,
          },
          curr.id
        );
        if (error) updateStateWorkspace(curr.id, { iconId: curr.iconId });

        return { error };
      },
      folder: isFolder(curr, dirType)
        ? async () => {
            updateStateFolder(curr.workspaceId, curr.id, { iconId: icon });
            const { error } = await updateFolder(
              {
                iconId: icon,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              curr.id
            );
            if (error)
              updateStateFolder(curr.workspaceId, curr.id, {
                iconId: curr.iconId,
              });

            return { error };
          }
        : undefined,
      file: isFile(curr, dirType)
        ? async () => {
            updateStateFile(curr.workspaceId, curr.folderId, curr.id, {
              iconId: icon,
            });
            const { error } = await updateFile(
              {
                iconId: icon,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              curr.id
            );
            if (error)
              updateStateFile(curr.workspaceId, curr.folderId, curr.id, {
                iconId: curr.iconId,
              });

            return { error };
          }
        : undefined,
    };

    const handler = handlers[dirType];
    if (!handler) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update icon. Please try again later!",
      });
      return;
    }

    const { error } = await handler();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    } else {
      toast({
        title: "Success",
        description: "Icon updated.",
      });
    }
  };

  const deleteBanner = async () => {
    if (!dirDetails) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete banner. Please try again later!",
      });
      return;
    }

    setDeletingBanner(true);
    const curr = dirDetails;

    // Map dirType → handler
    const handlers: Record<
      typeof dirType,
      (() => Promise<{ error: string | null }>) | undefined
    > = {
      file: isFile(curr, dirType)
        ? async () => {
            updateStateFile(curr.workspaceId, curr.folderId, curr.id, {
              bannerUrl: null,
            });
            const { error } = await updateFile(
              {
                bannerUrl: null,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              curr.id
            );
            if (error)
              updateStateFile(curr.workspaceId, curr.folderId, curr.id, {
                bannerUrl: curr.bannerUrl,
              });

            return { error };
          }
        : undefined,
      folder: isFolder(curr, dirType)
        ? async () => {
            updateStateFolder(curr.workspaceId, curr.id, { bannerUrl: null });
            const { error } = await updateFolder(
              {
                bannerUrl: null,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              curr.id
            );
            if (error)
              updateStateFolder(curr.workspaceId, curr.id, {
                bannerUrl: curr.bannerUrl,
              });

            return { error };
          }
        : undefined,
      workspace: async () => {
        updateStateWorkspace(curr.id, { bannerUrl: null });
        const { error } = await updateWorkspace(
          {
            bannerUrl: null,
            lastModifiedBy: useAppStore.getState().currentClientMutationId,
          },
          curr.id
        );
        if (error)
          updateStateWorkspace(curr.id, {
            bannerUrl: curr.bannerUrl,
          });

        return { error };
      },
    };

    const handler = handlers[dirType];
    if (!handler) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete banner. Please try again later!",
      });
      return;
    }

    const { error } = await handler();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    } else {
      toast({
        title: "Success",
        description: "Banner deleted.",
      });
    }

    setDeletingBanner(false);
  };

  const bannerProps: QuillTrashBannerProps = useMemo(() => {
    if (dirType === "file") {
      return { dirDetails: dirDetails as File, dirType: "file" };
    } else if (dirType === "folder") {
      return { dirDetails: dirDetails as appFoldersType, dirType: "folder" };
    } else {
      return {
        dirDetails: dirDetails as appWorkspacesType,
        dirType: "workspace",
      };
    }
  }, [dirDetails, dirType]);

  return (
    <>
      <QuillTrashBanner {...bannerProps} />
      <div
        style={{
          backgroundSize: "100px 100px, cover",
        }}
        className="relative flex w-[calc(100%-40px)] min-h-[140px] bg-sidebar bg-sidebar-grain bg-blend-overlay mx-auto my-4 overflow-hidden rounded-xl shadow-sidebar-accent shadow-md"
      >
        {dirDetails.bannerUrl && (
          <>
            <div className="bg-black/40 backdrop-blur absolute inset-0 z-10 rounded-xl" />
            <Image
              key={dirDetails.bannerUrl}
              priority
              src={getSupabaseImageUrl(
                "file-banners",
                dirDetails.bannerUrl,
                dirDetails.updatedAt
              )}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="w-full h-full object-cover absolute inset-0 rounded-xl animate-in fade-in slide-in-from-bottom-4 ease-in-out duration-500"
              alt="Banner Image"
            />
          </>
        )}
        <div className="z-20 flex gap-2 sm:gap-4 px-4 py-8">
          <div className="flex flex-col justify-center">
            <TooltipComponent
              asChild
              message="Select Emoji"
              aria-label="Select Emoji"
            >
              <EmojiPicker asChild getValue={iconOnChange}>
                <Button
                  variant="ghost"
                  className="text-6xl hover:bg-muted py-2 px-0 w-auto h-auto focus-visible:ring-offset-0"
                >
                  {dirDetails.iconId || "📄"}
                </Button>
              </EmojiPicker>
            </TooltipComponent>
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="text-primary-foreground text-4xl sm:text-5xl font-bold">
              {dirDetails.title || "Loading..."}
            </span>
            <span className="text-primary-foreground/70 text-lg sm:text-xl">
              {dirType.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="absolute flex z-20 bottom-2 right-2 items-center justify-center gap-2">
          <BannerUpload id={fileId} dirType={dirType}>
            <Button
              disabled={deletingBanner}
              variant="ghost"
              size="sm"
              className="gap-2 flex item-center justify-center hover:bg-transparent px-2 text-sidebar-foreground hover:text-sidebar-accent-foreground h-auto py-1 focus-visible:ring-offset-0"
            >
              <Plus size={16} />
              {dirDetails.bannerUrl ? "Update Banner" : "Add Banner"}
            </Button>
          </BannerUpload>
          {dirDetails.bannerUrl && (
            <Button
              disabled={deletingBanner}
              onClick={deleteBanner}
              variant="ghost"
              size="sm"
              className="gap-2 flex item-center justify-center hover:bg-transparent px-2 text-sidebar-foreground hover:text-sidebar-accent-foreground h-auto py-1 focus-visible:ring-offset-0"
            >
              <XCircleIcon size={16} />
              <span className="whitespace-nowrap font-normal">
                Remove Banner
              </span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center flex-col relative">
        <div
          id="container"
          className="w-full max-w-[800px] relative selection:bg-[var(--selection-color)] selection:text-white px-2"
          ref={quillWrapperRef}
        />
      </div>
    </>
  );
};

export default QuillEditor;
