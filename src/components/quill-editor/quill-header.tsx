"use client";

import { useRealtimeQuill } from "@/lib/hooks/useRealtimeQuill";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useDirectoryBreadcrumbs } from "@/lib/hooks/useDirectoryBreadcrumbs";
import { memo, type ReactNode } from "react";
import { getSupabaseImageUrl } from "@/lib/utils";
import { CloudAlert, CloudCheck, Wifi, WifiOff } from "lucide-react";
import { stringToColor } from "@/lib/color-generator";
import { Skeleton } from "../ui/skeleton";

export default function QuillHeader() {
  // Update quill content and cursors between collaborators
  const { collaborators, saving, isConnected } = useRealtimeQuill();

  return (
    <div className="w-full max-h-full my-auto flex flex-wrap items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
        <div className="inline-flex ml-2 gap-2 items-center align-middle">
          <HeaderBadge
            tooltipContent={
              isConnected ? "Realtime Connected" : "Realtime Connecting..."
            }
          >
            <Badge
              aria-label="Realtime Status"
              variant="secondary"
              className={`${
                isConnected
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-red-700 hover:bg-red-800"
              } text-white transition-colors`}
            >
              {isConnected ? (
                <Wifi className="size-3.5 sm:size-4" />
              ) : (
                <WifiOff className="size-3.5 sm:size-4 animate-pulse" />
              )}
            </Badge>
          </HeaderBadge>

          <HeaderBadge
            tooltipContent={saving ? "Saving Changes..." : "Changes Saved"}
          >
            <Badge
              aria-label="Saving Status"
              variant="secondary"
              className={`${
                saving
                  ? "bg-orange-700 hover:bg-orange-800"
                  : "bg-emerald-700 hover:bg-emerald-800"
              } text-white transition-colors`}
            >
              {saving ? (
                <CloudAlert className="size-3.5 sm:size-4 animate-pulse" />
              ) : (
                <CloudCheck className="size-3.5 sm:size-4" />
              )}
            </Badge>
          </HeaderBadge>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-max">
        <p className="hidden sm:block text-sm">Active Collaborators:</p>
        <div className="inline-flex items-center h-6 sm:h-8">
          {collaborators.map((collaborator) => (
            <Collaborator
              key={collaborator.id}
              id={collaborator.id}
              avatarUrl={getSupabaseImageUrl(
                "avatars",
                collaborator.avatarUrl,
                collaborator.updatedAt
              )}
              email={collaborator.email}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const Breadcrumbs = () => {
  const breadCrumbs = useDirectoryBreadcrumbs();

  return breadCrumbs.length ? (
    <span className="align-middle">{breadCrumbs}</span>
  ) : (
    <Skeleton className="inline-flex min-w-36 h-[1.3rem] align-middle bg-sidebar-accent" />
  );
};

const HeaderBadge = ({
  children,
  tooltipContent,
}: {
  children: ReactNode;
  tooltipContent: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger className="flex items-center justify-center rounded-full outline-none ring-sidebar-ring focus-visible:ring-2">
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};

const Collaborator = memo(function Collaborator({
  avatarUrl,
  email,
  id,
}: {
  avatarUrl: string;
  email: string;
  id: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          style={{
            borderColor: stringToColor(id),
          }}
          className="first:ml-0 -ml-3 bg-background border-2 flex items-center justify-center dark:border-white aspect-square w-auto h-full rounded-full"
        >
          <AvatarImage
            src={avatarUrl}
            alt="Collaborator Avatar"
            className="rounded-full"
          />
          <AvatarFallback>
            {email?.substring(0, 2)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{email}</TooltipContent>
    </Tooltip>
  );
});
