"use client";

import { Collaborator, Workspace } from "@/lib/supabase/supabase.types";
import { useRouter } from "next/navigation";
import { type Dispatch, type FC, type SetStateAction, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";
import { Lock, Plus, Share } from "lucide-react";
import { Button } from "../ui/button";
import { v4 } from "uuid";
import { createWorkspace } from "@/lib/supabase/actions";
import CollaboratorSearch from "./collaborator-search";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "../ui/use-toast";
import { getSupabaseImageUrl } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/app-store";

interface WorkspaceCreatorProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const WorkspaceCreator: FC<WorkspaceCreatorProps> = ({
  setOpen: setOpenCreatorDialog,
}) => {
  const router = useRouter();
  const [permissions, setPermissions] = useState("private");
  const [title, setTitle] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addCollaborator = (user: Collaborator) => {
    toast({
      title: "Success",
      description: "Collaborator added.",
    });
    setCollaborators([...collaborators, user]);
  };

  const removeCollaborator = (user: Collaborator) => {
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
  };

  const createItem = async () => {
    if (
      !title ||
      (permissions === "shared" && collaborators.length === 0) ||
      isLoading
    )
      return;

    setIsLoading(true);
    const uuid = v4();
    const newWorkspace: Omit<Workspace, "workspaceOwner"> = {
      data: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      iconId: "💼",
      id: uuid,
      inTrash: null,
      title,
      logo: null,
      bannerUrl: null,
      lastModifiedBy: useAppStore.getState().currentClientMutationId,
    };
    const { error } = await createWorkspace(
      newWorkspace,
      permissions === "shared" ? collaborators.map((c) => c.id) : undefined
    );
    if (error) {
      toast({ title: "Error", variant: "destructive", description: error });
      setIsLoading(false);
      return;
    }
    setOpenCreatorDialog?.(false);
    toast({
      title: "Success",
      description: `Created new ${permissions} workspace.`,
    });
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="flex gap-4 flex-col mt-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          name="name"
          value={title}
          placeholder="Workspace Name"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          spellCheck={false}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permission
        </Label>
        <Select
          onValueChange={(val) => {
            setPermissions(val);
          }}
          defaultValue={permissions}
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
      </div>
      {permissions === "shared" && (
        <>
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
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">
              Collaborators {collaborators.length || ""}
            </span>
            <ScrollArea className="h-[120px] overflow-y-auto w-full rounded-md border border-muted-foreground/20">
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
                            alt={`${collaborator.email}'s Avatar`}
                          />
                          <AvatarFallback>
                            {collaborator.email?.slice(0, 2).toUpperCase()}
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
        </>
      )}
      <Button
        type="button"
        disabled={
          !title ||
          (permissions === "shared" && collaborators.length === 0) ||
          isLoading
        }
        variant={"secondary"}
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default WorkspaceCreator;
