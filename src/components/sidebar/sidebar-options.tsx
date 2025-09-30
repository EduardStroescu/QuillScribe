export const dynamic = "force-dynamic";

import {
  getAllUserWorkspaces,
  getUser,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";
import { SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar";
import { NavUser } from "./sidebar-user";
import db from "@/lib/supabase/db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import WorkspaceDropdown from "./workspace-dropdown";
import { redirect } from "next/navigation";
import PlanUsage from "./plan-usage";
import NativeNavigation from "./native-navigation";
import ModeToggle from "../global/mode-toggle";
import FoldersDropdownList from "./folders-dropdown-list";

export async function SidebarOptions() {
  const [authUser, subscription] = await Promise.all([
    getUser(),
    getUserSubscriptionStatus(),
  ]);

  if (!authUser || subscription.error) redirect("/login");

  const [userDetails, workspaces] = await Promise.all([
    db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, authUser.id),
    }),
    getAllUserWorkspaces(),
  ]);

  if (!userDetails) redirect("/login");

  const supabase = createServerComponentClient({ cookies });
  const navUser = {
    ...userDetails,
    avatarUrl: userDetails.avatarUrl
      ? supabase.storage.from("avatars").getPublicUrl(userDetails.avatarUrl)
          ?.data?.publicUrl +
        "?v=" +
        encodeURIComponent(userDetails.updatedAt)
      : "",
  };

  // get all the different workspaces: private && collaborating && shared
  const { privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces } =
    workspaces;

  return (
    <>
      <SidebarHeader>
        <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
        />
      </SidebarHeader>
      <SidebarContent>
        <PlanUsage subscription={subscription.data} />
        <NativeNavigation
          workspaces={[
            ...privateWorkspaces,
            ...sharedWorkspaces,
            ...collaboratingWorkspaces,
          ]}
        />
        <FoldersDropdownList />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser subscription={subscription.data} user={navUser} />
      </SidebarFooter>
    </>
  );
}
