"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  type Subscription,
  type Workspace,
} from "@/lib/supabase/supabase.types";
import { Button } from "../ui/button";
import Loader from "../global/loader";
import { createWorkspace } from "@/lib/supabase/actions";
import { toast } from "../ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CreateWorkspaceFormSchema } from "@/lib/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSidebar } from "../ui/sidebar";
import { useAppStore, useAppStoreActions } from "@/lib/stores/app-store";
import TooltipComponent from "../global/tooltip-component";
import EmojiPicker from "../global/emoji-picker";

const DashboardSetup = ({ subscription }: { subscription: Subscription }) => {
  const [selectedEmoji, setSelectedEmoji] = useState("💼");
  const { addWorkspace } = useAppStoreActions();
  const { setOpen } = useSidebar();

  const router = useRouter();
  const supabase = createClientComponentClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    resolver: zodResolver(CreateWorkspaceFormSchema),
    mode: "onChange",
    defaultValues: {
      workspaceName: "",
    },
  });

  // Close sidebar when dashboard setup is loaded
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateWorkspaceFormSchema>
  > = async (value) => {
    const file = value.logo?.[0] as File | undefined;
    let filePath: string | null = null;
    const workspaceUUID = uuid();

    if (file) {
      try {
        const storageResult = await supabase.storage
          .from("workspace-logos")
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            upsert: true,
          });
        if (storageResult.error) throw new Error("Logo upload failed");
        filePath = storageResult.data.path;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not upload your workspace logo, try again later!",
        });
      }
    }

    const newWorkspace: Omit<Workspace, "workspaceOwner"> = {
      data: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      iconId: selectedEmoji,
      id: workspaceUUID,
      inTrash: null,
      title: value.workspaceName,
      logo: filePath,
      bannerUrl: null,
      lastModifiedBy: useAppStore.getState().currentClientMutationId,
    };
    const createWorkspaceResult = await createWorkspace(newWorkspace);
    if (!createWorkspaceResult.data) {
      toast({
        title: "Error",
        variant: "destructive",
        description: createWorkspaceResult.error,
      });
      return;
    }
    addWorkspace({ ...createWorkspaceResult.data, folders: [] });
    toast({
      title: "Workspace Created",
      description: `${createWorkspaceResult.data.title} has been created successfully.`,
    });
    router.replace(`/dashboard/${createWorkspaceResult.data.id}`);
    setOpen(true);
    reset();
  };

  return (
    <Card className="w-[800px] h-[100dvh] sm:h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started. You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <TooltipComponent
                asChild
                message="Select Emoji"
                aria-label="Select Emoji"
              >
                <EmojiPicker
                  asChild
                  getValue={(emoji) => setSelectedEmoji(emoji)}
                  aria-label="Select Emoji"
                >
                  <Button
                    variant="ghost"
                    className="text-5xl hover:bg-muted py-2 px-0 w-auto h-auto focus-visible:ring-offset-0"
                  >
                    {selectedEmoji}
                  </Button>
                </EmojiPicker>
              </TooltipComponent>
              <div className="w-full flex flex-col gap-1">
                <Label
                  htmlFor="workspaceName"
                  className="text-sm text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  {...register("workspaceName", {
                    required: "Workspace name is required",
                  })}
                  id="workspaceName"
                  type="text"
                  placeholder="Workspace Name"
                  disabled={isLoading}
                  spellCheck={false}
                />
                <small className="text-red-600">
                  {errors?.workspaceName?.message?.toString()}
                </small>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="logo" className="text-sm text-muted-foreground">
                Workspace Logo
              </Label>
              <Input
                {...register("logo", {
                  required: false,
                })}
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace Name"
                disabled={isLoading || subscription?.status !== "active"}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
              {subscription?.status !== "active" && (
                <small className="text-muted-foreground block">
                  To customize your workspace, you need to be on a Pro Plan
                </small>
              )}
            </div>
          </div>
          <div className="ml-auto mt-2 max-w-max">
            <Button disabled={isLoading} type="submit">
              {!isLoading ? "Create Workspace" : <Loader />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
