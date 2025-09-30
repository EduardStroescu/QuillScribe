import { type FC, memo } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  deleteFile,
  deleteFolder,
  updateFile,
  updateFolder,
} from "@/lib/supabase/actions";
import { toast } from "../ui/use-toast";
import {
  type appFoldersType,
  type appWorkspacesType,
  useAppStore,
  useAppStoreActions,
} from "@/lib/stores/app-store";
import { type File } from "@/lib/supabase/supabase.types";
import { isFile, isFolder } from "@/lib/utils";

export type QuillTrashBannerProps =
  | {
      dirDetails: appWorkspacesType;
      dirType: "workspace";
    }
  | {
      dirDetails: appFoldersType;
      dirType: "folder";
    }
  | {
      dirDetails: File;
      dirType: "file";
    };

const QuillTrashBanner: FC<QuillTrashBannerProps> = memo(
  function QuillTrashBanner({ dirDetails, dirType }) {
    const {
      addFile: addStateFile,
      updateFile: updateStateFile,
      addFolder: addStateFolder,
      updateFolder: updateStateFolder,
      deleteFile: deleteStateFile,
      deleteFolder: deleteStateFolder,
    } = useAppStoreActions();
    const router = useRouter();

    const restoreFileHandler = async () => {
      if (!dirDetails) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Could not restore the ${dirType}. Please try again later!`,
        });
        return;
      }

      const curr = dirDetails;

      const handlers: Record<
        typeof dirType,
        (() => Promise<{ error: string | null }>) | undefined
      > = {
        file: isFile(curr, dirType)
          ? async () => {
              updateStateFile(curr.workspaceId, curr.folderId, curr.id, {
                inTrash: null,
              });
              const { error } = await updateFile(
                {
                  inTrash: null,
                  lastModifiedBy:
                    useAppStore.getState().currentClientMutationId,
                },
                curr.id
              );
              if (error)
                updateStateFile(curr.workspaceId, curr.folderId, curr.id, {
                  inTrash: curr.inTrash,
                });

              return { error };
            }
          : undefined,
        folder: isFolder(curr, dirType)
          ? async () => {
              updateStateFolder(curr.workspaceId, curr.id, {
                inTrash: null,
              });
              const { error } = await updateFolder(
                {
                  inTrash: null,
                  lastModifiedBy:
                    useAppStore.getState().currentClientMutationId,
                },
                curr.id
              );
              if (error)
                updateStateFolder(curr.workspaceId, curr.id, {
                  inTrash: curr.inTrash,
                });

              return { error };
            }
          : undefined,
        workspace: undefined, // No workspaces in trash
      };

      const handler = handlers[dirType];
      if (!handler) return;

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
          description: `${
            dirType[0].toUpperCase() + dirType.slice(1)
          } restored successfully!`,
        });
      }
    };

    const deleteFileHandler = async () => {
      if (!dirDetails) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Could not delete the ${dirType}. Please try again later!`,
        });
        return;
      }

      const curr = dirDetails;

      const handlers: Record<
        typeof dirType,
        (() => Promise<{ error: string | null }>) | undefined
      > = {
        file: isFile(curr, dirType)
          ? async () => {
              deleteStateFile(curr.workspaceId, curr.folderId, curr.id);
              const { error } = await deleteFile(curr.id);
              if (error) {
                addStateFile(curr.workspaceId, curr.folderId, curr);
                return { error };
              }
              router.replace(`/dashboard/${curr.workspaceId}/${curr.folderId}`);
              return { error };
            }
          : undefined,
        folder: isFolder(curr, dirType)
          ? async () => {
              deleteStateFolder(curr.workspaceId, curr.id);
              const { error } = await deleteFolder(curr.id);
              if (error) {
                addStateFolder(curr.workspaceId, curr);
                return { error };
              }
              router.replace(`/dashboard/${curr.workspaceId}`);
              return { error };
            }
          : undefined,
        workspace: undefined, // No workspaces in trash
      };

      const handler = handlers[dirType];
      if (!handler) return;

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
          description: `${
            dirType[0].toUpperCase() + dirType.slice(1)
          } deleted successfully!`,
        });
      }
    };

    return (
      <>
        {dirDetails.inTrash && (
          <div className="relative">
            <article className="py-2 z-40 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
              <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                <span className="text-white">
                  This {dirType} is in the trash.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                  onClick={restoreFileHandler}
                >
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                  onClick={deleteFileHandler}
                >
                  Delete
                </Button>
              </div>
              <span className="text-sm text-white">{dirDetails.inTrash}</span>
            </article>
          </div>
        )}
      </>
    );
  }
);

export default QuillTrashBanner;
