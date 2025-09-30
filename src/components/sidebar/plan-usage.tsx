"use client";

import { type FC } from "react";
import { MAX_FOLDERS_FREE_PLAN } from "@/lib/const/constants";
import { type Subscription } from "@/lib/supabase/supabase.types";
import { Progress } from "../ui/progress";
import QuillScribeDiamondIcon from "../icons/quillScribeDiamondIcon";
import { SidebarGroup, SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { useParams } from "next/navigation";
import { selectWorkspaceById, useAppStore } from "@/lib/stores/app-store";

interface PlanUsageProps {
  subscription: Subscription | null;
}

const ZERO = 0;

const PlanUsage: FC<PlanUsageProps> = ({ subscription }) => {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const usagePercentage = useAppStore((state) => {
    const folderCount =
      selectWorkspaceById(workspaceId)(state)?.folders.length ?? ZERO;
    return (folderCount / MAX_FOLDERS_FREE_PLAN) * 100;
  });

  if (subscription?.status === "active") return null;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex gap-2 mb-2 items-center">
            <div className="h-4 w-4">
              <QuillScribeDiamondIcon />
            </div>
            <div className="flex justify-between w-full items-center brightness-75">
              <div>Free Plan</div>
              <small>{usagePercentage.toFixed(0)}% / 100%</small>
            </div>
          </div>
          <Progress
            value={usagePercentage}
            progressColor="bg-sidebar-accent"
            className="h-1"
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default PlanUsage;
