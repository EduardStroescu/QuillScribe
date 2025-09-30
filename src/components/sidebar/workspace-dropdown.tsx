"use client";

import { type Workspace } from "@/lib/supabase/supabase.types";
import { type FC, useEffect, useMemo } from "react";
import SelectedWorkspace from "./selected-workspace";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import WorkspaceCreator from "../global/workspace-creator";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronsUpDown, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { useAppStore, useAppStoreActions } from "@/lib/stores/app-store";
import { useShallow } from "zustand/react/shallow";

interface WorkspaceDropdownProps {
  privateWorkspaces: Workspace[];
  sharedWorkspaces: Workspace[];
  collaboratingWorkspaces: Workspace[];
}

const WorkspaceDropdown: FC<WorkspaceDropdownProps> = ({
  privateWorkspaces,
  sharedWorkspaces,
  collaboratingWorkspaces,
}) => {
  const { isMobile } = useSidebar();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { setWorkspaces } = useAppStoreActions();

  const workspaces = useAppStore(useShallow((state) => state.workspaces));
  const selectedWorkspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId),
    [workspaceId, workspaces]
  );

  const {
    statePrivateWorkspaces,
    stateSharedWorkspaces,
    stateCollaboratingWorkspaces,
  } = useMemo(() => {
    const propPrivateIds = new Set(privateWorkspaces.map((w) => w.id));
    const propSharedIds = new Set(sharedWorkspaces.map((w) => w.id));
    const propCollaboratingIds = new Set(
      collaboratingWorkspaces.map((w) => w.id)
    );

    return {
      statePrivateWorkspaces: workspaces.filter((w) =>
        propPrivateIds.has(w.id)
      ),
      stateSharedWorkspaces: workspaces.filter((w) => propSharedIds.has(w.id)),
      stateCollaboratingWorkspaces: workspaces.filter((w) =>
        propCollaboratingIds.has(w.id)
      ),
    };
  }, [
    privateWorkspaces,
    sharedWorkspaces,
    collaboratingWorkspaces,
    workspaces,
  ]);

  useEffect(() => {
    const currentWorkspaces = useAppStore.getState();

    // Flatten workspaces from props
    const incoming = [
      ...privateWorkspaces,
      ...sharedWorkspaces,
      ...collaboratingWorkspaces,
    ];

    const merged = incoming.map((workspace) => {
      const existing = currentWorkspaces.actions.findWorkspaceById(
        workspace.id
      );

      // if existing and newer -> keep existing, otherwise update with incoming
      if (
        existing &&
        new Date(existing.updatedAt).getTime() >=
          new Date(workspace.updatedAt).getTime()
      ) {
        return existing;
      }

      return {
        ...workspace,
        folders: existing?.folders ?? [],
      };
    });
    setWorkspaces(merged);
  }, [
    privateWorkspaces,
    sharedWorkspaces,
    collaboratingWorkspaces,
    setWorkspaces,
  ]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={isMobile ? true : false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              variant="outline"
              className="bg-sidebar-accent rounded-full"
            >
              {selectedWorkspace ? (
                <SelectedWorkspace workspace={selectedWorkspace} />
              ) : (
                <div className="w-full flex items-center gap-2">
                  <Zap className="w-8 h-8 rounded-full" />
                  <span>Select a workspace</span>
                </div>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-sidebar-accent/40 backdrop-blur-lg group pt-2 pb-0 overflow-y-auto overflow-x-hidden border-muted-foreground"
            align="center"
          >
            {!!statePrivateWorkspaces.length && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-0 py-0">
                  <p className="text-muted-foreground">Private</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statePrivateWorkspaces.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    asChild
                    className="text-sidebar-foreground focus:text-sidebar-accent-foreground focus:bg-sidebar-accent my-2"
                  >
                    <Link href={`/dashboard/${option.id}`}>
                      <SelectedWorkspace workspace={option} />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            {!!stateSharedWorkspaces.length && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-0 py-0">
                  <p className="text-muted-foreground">Shared</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stateSharedWorkspaces.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    asChild
                    className="text-sidebar-foreground focus:text-sidebar-accent-foreground focus:bg-sidebar-accent my-2"
                  >
                    <Link href={`/dashboard/${option.id}`}>
                      <SelectedWorkspace workspace={option} />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            {!!stateCollaboratingWorkspaces.length && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-0 py-0">
                  <p className="text-muted-foreground">Collaborating</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stateCollaboratingWorkspaces.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    asChild
                    className="text-sidebar-foreground focus:text-sidebar-accent-foreground focus:bg-sidebar-accent my-2"
                  >
                    <Link href={`/dashboard/${option.id}`}>
                      <SelectedWorkspace workspace={option} />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator />
            <CustomDialogTrigger
              header="Create A Workspace"
              content={<WorkspaceCreator />}
              className="flex transition-all hover:bg-sidebar-accent justify-center items-center gap-2 p-2 w-full rounded-sm text-sidebar-foreground focus:text-sidebar-accent-foreground my-2"
              description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
            >
              <span className="rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center">
                +
              </span>
              <span>Create workspace</span>
            </CustomDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default WorkspaceDropdown;
