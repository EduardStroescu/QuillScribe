"use client";

import Link from "next/link";
import QuillScribeHomeIcon from "../icons/quillScribeHomeIcon";
import QuillScribeSettingsIcon from "../icons/quillScribeSettingsIcon";
import QuillScribeTrashIcon from "../icons/quillScribeTrashIcon";
import Settings from "../settings/settings";
import Trash from "../trash/trash";
import { useParams } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Workspace } from "@/lib/supabase/supabase.types";

const NativeNavigation = ({ workspaces }: { workspaces: Workspace[] }) => {
  const { workspaceId } = useParams();

  const isDisabled = !workspaces.some((w) => w.id === workspaceId);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="group/native"
            disabled={isDisabled}
          >
            <Link href={`/dashboard/${workspaceId}`}>
              <QuillScribeHomeIcon />
              <span>My Workspace</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Settings asChild>
            <SidebarMenuButton className="group/native" disabled={isDisabled}>
              <QuillScribeSettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </Settings>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Trash asChild>
            <SidebarMenuButton className="group/native" disabled={isDisabled}>
              <QuillScribeTrashIcon />
              <span>Trash</span>
            </SidebarMenuButton>
          </Trash>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NativeNavigation;
