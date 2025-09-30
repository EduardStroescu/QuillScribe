"use client";

import { UploadBannerFormSchema } from "@/lib/types";
import { type Dispatch, type FC, type SetStateAction } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loader from "../global/loader";
import {
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/actions";
import { toast } from "../ui/use-toast";
import { useAppStore, useAppStoreActions } from "@/lib/stores/app-store";
import { useParams } from "next/navigation";
import { uploadFile } from "@/lib/supabase/uploadFile";

interface BannerUploadFormProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  dirType: "workspace" | "file" | "folder";
  id: string;
}

const BannerUploadForm: FC<BannerUploadFormProps> = ({
  setOpen,
  dirType,
  id,
}) => {
  const { workspaceId, folderId } = useParams<{
    workspaceId: string;
    folderId: string;
  }>();

  const {
    updateWorkspace: updateStateWorkspace,
    updateFolder: updateStateFolder,
    updateFile: updateStateFile,
  } = useAppStoreActions();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: "onChange",
  });

  const onSubmitHandler: SubmitHandler<
    z.infer<typeof UploadBannerFormSchema>
  > = async (values) => {
    const file = values.banner?.[0];
    if (!file || !id) {
      toast({
        variant: "destructive",
        title: "Error! Could not upload your banner, please try again later.",
      });
      return;
    }

    const { publicPath: banner } = await uploadFile(
      "file-banners",
      file,
      `banner-${id}`
    );

    if (!banner) {
      toast({
        variant: "destructive",
        title: "Error! Could not upload your banner, please try again later.",
      });
      return;
    }

    // Map dirType → update function + state updater
    const handlers: Record<
      typeof dirType,
      | (() => Promise<{
          error: string | null;
        }>)
      | undefined
    > = {
      file:
        workspaceId && folderId
          ? async () => {
              const { data: updatedFile, error } = await updateFile(
                {
                  bannerUrl: banner,
                  lastModifiedBy:
                    useAppStore.getState().currentClientMutationId,
                },
                id
              );
              if (updatedFile)
                updateStateFile(workspaceId, folderId, id, {
                  bannerUrl: updatedFile.bannerUrl,
                  updatedAt: updatedFile.updatedAt,
                });

              return { error };
            }
          : undefined,
      folder:
        workspaceId && folderId
          ? async () => {
              const { data: updatedFolder, error } = await updateFolder(
                {
                  bannerUrl: banner,
                  lastModifiedBy:
                    useAppStore.getState().currentClientMutationId,
                },
                id
              );
              if (updatedFolder)
                updateStateFolder(workspaceId, id, {
                  bannerUrl: updatedFolder.bannerUrl,
                  updatedAt: updatedFolder.updatedAt,
                });

              return { error };
            }
          : undefined,
      workspace: workspaceId
        ? async () => {
            const { data: updatedWorkspace, error } = await updateWorkspace(
              {
                bannerUrl: banner,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              id
            );
            if (updatedWorkspace)
              updateStateWorkspace(id, {
                bannerUrl: updatedWorkspace.bannerUrl,
                updatedAt: updatedWorkspace.updatedAt,
              });

            return { error };
          }
        : undefined,
    };

    const handler = handlers[dirType];
    if (!handler) {
      toast({
        variant: "destructive",
        title: "Error! Could not upload your banner, please try again later.",
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
        description: "Banner updated.",
      });
    }

    setOpen?.(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-1"
    >
      <Label className="text-sm text-muted-foreground" htmlFor="bannerImage">
        Banner Image
      </Label>
      <Input
        id="bannerImage"
        type="file"
        accept="image/*"
        disabled={isUploading}
        {...register("banner", { required: "Banner Image is required" })}
      />
      <small className="text-red-600">
        {errors.banner?.message?.toString()}
      </small>
      <Button disabled={isUploading} type="submit">
        {!isUploading ? "Upload Banner" : <Loader />}
      </Button>
    </form>
  );
};

export default BannerUploadForm;
