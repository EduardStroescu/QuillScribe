import { type Workspace } from "@/lib/supabase/supabase.types";
import { getSupabaseImageUrl } from "@/lib/utils";
import { type FC } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

interface SelectedWorkspaceProps {
  workspace: Omit<Workspace, "data">;
  isHeader?: boolean;
}

const SelectedWorkspace: FC<SelectedWorkspaceProps> = ({ workspace }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="w-8 h-8">
        <AvatarImage
          alt="Workspace Logo"
          src={getSupabaseImageUrl(
            "workspace-logos",
            workspace.logo,
            workspace.updatedAt
          )}
        />
        <AvatarFallback className="w-full h-full flex items-center justify-center text-white bg-sidebar outline outline-white -outline-offset-1 rounded-full font-bold font-serif">
          {workspace.title?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-lg truncate whitespace-nowrap">
        {workspace.title}
      </span>
    </div>
  );
};

export default SelectedWorkspace;
