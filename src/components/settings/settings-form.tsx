"use client";

import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Collaborator } from "@/lib/supabase/supabase.types";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useParams, useRouter } from "next/navigation";
import { Briefcase, Lock, Plus, Share, Users, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  addCollaborators,
  deleteWorkspace,
  removeCollaborators,
  transferWorkspaceOwnership,
  updateWorkspace,
} from "@/lib/supabase/actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import CollaboratorSearch from "../global/collaborator-search";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { toast } from "../ui/use-toast";
import {
  selectWorkspaceById,
  useAppStore,
  useAppStoreActions,
} from "@/lib/stores/app-store";
import { useShallow } from "zustand/react/shallow";
import { getSupabaseImageUrl } from "@/lib/utils";
import { uploadFile } from "@/lib/supabase/uploadFile";
import QuillScribeProfileIcon from "../icons/quillScribeProfileIcon";
import OwnerSearch from "../global/owner-search";
import { Skeleton } from "../ui/skeleton";

interface SettingsFormProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const SettingsForm: FC<SettingsFormProps> = ({
  setOpen: setOpenSettingsDialog,
}) => {
  const router = useRouter();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { user, subscription } = useSupabaseUser();
  const { setOpen: setOpenSubscriptionModal } = useSubscriptionModal();

  const currWorkspace = useAppStore(
    useShallow(selectWorkspaceById(workspaceId))
  );
  const {
    updateWorkspace: updateStateWorkspace,
    deleteWorkspace: deleteStateWorkspace,
  } = useAppStoreActions();
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [owner, setOwner] = useState<Collaborator>({
    id: "",
    email: "",
    avatarUrl: "",
    updatedAt: "",
  });

  const isDemoUser =
    user?.email === process.env.NEXT_PUBLIC_PRO_DEMO_EMAIL ||
    user?.email === process.env.NEXT_PUBLIC_FREE_DEMO_EMAIL;

  const transferOwnership = async (owner: Collaborator) => {
    if (isDemoUser) {
      toast({
        title: "Error",
        description: "Cannot transfer ownership in demo accounts.",
        variant: "destructive",
      });
      return;
    }
    if (currWorkspace?.workspaceOwner !== user?.id) {
      toast({
        title: "Error",
        description: "Only the workspace owner can transfer ownership.",
      });
      return;
    }
    const transferResponse = await transferWorkspaceOwnership(
      workspaceId,
      owner.id
    );
    if (transferResponse.error) {
      toast({ title: "Error", description: transferResponse.error });
      return;
    }
    setOpenSettingsDialog?.(false);
    updateStateWorkspace(workspaceId, { workspaceOwner: owner.id });
    toast({ title: "Success", description: "Ownership transferred." });
  };

  const addCollaborator = async (profile: Collaborator) => {
    if (!currWorkspace?.id) return;
    if (subscription?.status !== "active" && collaborators.length >= 2) {
      setOpenSubscriptionModal(true);
      return;
    }
    const addResponse = await addCollaborators([profile], currWorkspace.id);
    if (addResponse.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: addResponse.error,
      });
      return;
    }
    setCollaborators([...collaborators, profile]);
    toast({
      title: "Success",
      description: "Collaborator added.",
    });
  };

  const removeCollaborator = async (user: Collaborator) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    const removeResponse = await removeCollaborators([user], workspaceId);
    if (removeResponse.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: removeResponse.error,
      });
      return;
    }
    toast({ title: "Success", description: "Collaborator removed." });
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
  };

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;
    const currWorkspaceTitle = currWorkspace?.title;
    updateStateWorkspace(workspaceId, { title: e.target.value });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      const updateResponse = await updateWorkspace(
        {
          title: e.target.value,
          lastModifiedBy: useAppStore.getState().currentClientMutationId,
        },
        workspaceId
      );
      if (currWorkspaceTitle && updateResponse.error) {
        updateStateWorkspace(workspaceId, { title: currWorkspaceTitle });
        toast({
          variant: "destructive",
          title: "Error",
          description: updateResponse.error,
        });
        return;
      }
      toast({ title: "Success", description: "Title updated." });
    }, 850);
  };

  const onChangeWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const { publicPath: logo, error: logoUploadError } = await uploadFile(
      "workspace-logos",
      file,
      `workspaceLogo.${workspaceId}`
    );
    if (logoUploadError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not upload the logo. Please try again later!",
      });
      return;
    }

    const { data: updateResponse, error } = await updateWorkspace(
      {
        logo: logo,
        lastModifiedBy: useAppStore.getState().currentClientMutationId,
      },
      workspaceId
    );

    if (updateResponse) {
      updateStateWorkspace(workspaceId, { logo: updateResponse.logo });
      toast({ title: "Success", description: "Logo updated." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
    setUploadingLogo(false);
  };

  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      const removeResponse = await removeCollaborators(
        collaborators,
        workspaceId
      );
      if (removeResponse.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: removeResponse.error,
        });
        return;
      }
    }
    toast({ title: "Success", description: "Workspace is now private." });
    setPermissions("private");
    setOpenAlertMessage(false);
  };

  const onPermissionsChange = (val: string) => {
    if (currWorkspace?.workspaceOwner !== user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only the workspace owner can change permissions.",
      });
      return;
    }
    if (val === "private") {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  const onDeleteWorkspace = async () => {
    if (!currWorkspace?.id) return;
    if (currWorkspace?.workspaceOwner !== user?.id) {
      toast({
        title: "Error",
        description: "Only the workspace owner can delete the workspace.",
      });
      return;
    }
    const deleteResponse = await deleteWorkspace(currWorkspace.id);
    if (deleteResponse.error) {
      toast({
        title: "Error",
        description: deleteResponse.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Success", description: "Workspace deleted." });
    deleteStateWorkspace(workspaceId);
    setOpenSettingsDialog?.(false);
    router.replace("/dashboard");
  };

  const removeLogo = async () => {
    if (!currWorkspace?.logo) return;
    const currLogo = currWorkspace.logo;
    updateStateWorkspace(workspaceId, { logo: null });
    const removeResponse = await updateWorkspace({ logo: null }, workspaceId);
    if (removeResponse.error) {
      updateStateWorkspace(workspaceId, { logo: currLogo });
      toast({
        title: "Error",
        description: removeResponse.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Success", description: "Logo removed." });
  };

  useEffect(() => {
    if (!currWorkspace?.workspaceOwner) return;
    const fetchOwner = async () => {
      try {
        const response = await fetch(
          `/api/users/${currWorkspace.workspaceOwner}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error((await response.json()).error);
        const data: Collaborator = await response.json();
        if (data) {
          setOwner(data);
        }
      } catch {
        return;
      }
    };
    fetchOwner();
  }, [currWorkspace?.workspaceOwner]);

  useEffect(() => {
    if (!currWorkspace?.id) return;
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(`/api/collaborators/${currWorkspace.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error((await response.json()).error);
        const data: Collaborator[] = await response.json();
        if (data.length) {
          setPermissions("shared");
          setCollaborators(data);
        }
      } catch {
        return;
      }
    };
    fetchCollaborators();
  }, [currWorkspace?.id]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
        Workspace
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Owner
        </Label>
        <div className="flex items-center">
          <Avatar>
            <AvatarImage
              src={getSupabaseImageUrl(
                "avatars",
                owner.avatarUrl,
                owner.updatedAt
              )}
              alt={`${owner?.email}'s Avatar`}
            />
            <AvatarFallback>
              <QuillScribeProfileIcon />
            </AvatarFallback>
          </Avatar>
          <div className="w-full flex flex-col ml-6 gap-2">
            <small className="text-muted-foreground text-sm">
              {owner.email?.length ? (
                owner.email
              ) : (
                <Skeleton className="w-1/2 h-5 bg-muted-foreground" />
              )}
            </small>
            <OwnerSearch
              getOwner={(owner) => {
                transferOwnership(owner);
              }}
            >
              <Button
                disabled={currWorkspace?.workspaceOwner !== user?.id}
                size="sm"
                className="text-sm flex gap-2 items-center max-w-min"
              >
                <Users size={16} />
                Transfer Ownership
              </Button>
            </OwnerSearch>
          </div>
        </div>
        <Label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Name
        </Label>
        <Input
          name="workspaceName"
          value={currWorkspace?.title ?? ""}
          placeholder="Workspace Name"
          onChange={workspaceNameChange}
          spellCheck={false}
        />
        <Label
          htmlFor="workspaceLogo"
          className="text-sm text-muted-foreground"
        >
          Workspace Logo
        </Label>
        <div className="flex items-center gap-2">
          <Input
            name="workspaceLogo"
            type="file"
            accept="image/*"
            placeholder="Workspace Logo"
            onChange={onChangeWorkspaceLogo}
            disabled={uploadingLogo || subscription?.status !== "active"}
          />
          <Button
            disabled={!currWorkspace?.logo || uploadingLogo}
            variant="destructive"
            className="text-destructive-foreground min-w-max"
            onClick={removeLogo}
          >
            Remove Logo
          </Button>
        </div>
        {subscription?.status !== "active" && (
          <small className="text-muted-foreground">
            To customize your workspace you need to be on a Pro Plan
          </small>
        )}
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permissions
        </Label>
        <Select
          onValueChange={onPermissionsChange}
          value={permissions}
          disabled={currWorkspace?.workspaceOwner !== user?.id}
        >
          <SelectTrigger className="w-full h-26">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
            <SelectGroup>
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>
                      Your workspace is private to you. You can choose to share
                      it later.
                    </p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share />
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <span>You can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {permissions === "shared" && (
          <div className="w-full flex flex-col">
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborator={(user) => {
                addCollaborator(user);
              }}
            >
              <Button size="sm" className="text-sm flex gap-2 items-center">
                <Plus size="16" />
                Add Collaborators
              </Button>
            </CollaboratorSearch>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Collaborators {collaborators.length || ""}
              </span>
              <ScrollArea className="h-[120px] overflow-y-auto w-full rounded-md border">
                {collaborators.length ? (
                  collaborators.map((collaborator) => {
                    return (
                      <div
                        className="w-[calc(100%-0.5rem)] px-2 py-1 flex justify-between items-center"
                        key={collaborator.id}
                      >
                        <div className="flex gap-2 items-center">
                          <Avatar>
                            <AvatarImage
                              src={getSupabaseImageUrl(
                                "avatars",
                                collaborator.avatarUrl,
                                collaborator.updatedAt
                              )}
                              alt={`${collaborator?.email}'s Avatar`}
                            />
                            <AvatarFallback>
                              {collaborator?.email?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                            {collaborator.email}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => removeCollaborator(collaborator)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                    <span className="text-muted-foreground text-sm">
                      You have no collaborators
                    </span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
      {currWorkspace?.workspaceOwner === user?.id && (
        <Alert variant={"destructive"}>
          <AlertDescription>
            Warning! Deleting you workspace will permanantly delete all data
            related to this workspace.
          </AlertDescription>
          <Button
            type="submit"
            size={"sm"}
            variant={"destructive"}
            className="mt-4 text-sm"
            onClick={onDeleteWorkspace}
          >
            Delete Workspace
          </Button>
        </Alert>
      )}
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDescription>
              Changing a Shared workspace to a Private workspace will remove all
              collaborators permanently.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;
