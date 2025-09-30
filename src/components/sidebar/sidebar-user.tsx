"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type Subscription, type User } from "@/lib/supabase/supabase.types";
import QuillScribeProfileIcon from "../icons/quillScribeProfileIcon";
import LogoutButton from "../global/logout-button";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { createStripePortalLink } from "@/lib/utils";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import UserModal from "../user/user-modal";

export function NavUser({
  user,
  subscription,
}: {
  user: User & { avatarUrl: string };
  subscription: Subscription | null;
}) {
  const { isMobile } = useSidebar();
  const { setOpen: setSubscriptionModalOpen } = useSubscriptionModal();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await createStripePortalLink({
        url: "/api/create-portal-link",
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later!",
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

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
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatarUrl}
                  alt={`${user.email || "User"}'s Avatar`}
                />
                <AvatarFallback className="rounded-full">
                  <QuillScribeProfileIcon />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span>
                  {subscription?.status === "active" ? "Pro Plan" : "Free Plan"}
                </span>
                <span className="truncate">{user.email || "User"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-sidebar-accent/40 backdrop-blur-lg min-w-56 rounded-lg border-muted-foreground"
            align="center"
          >
            <DropdownMenuLabel className="p-0 font-normal text-sidebar-accent-foreground">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    data-loaded="false"
                    onLoad={(evt) =>
                      evt.currentTarget.setAttribute("data-loaded", "true")
                    }
                    src={user.avatarUrl}
                    alt={`${user?.email || "User"}'s Avatar`}
                    className="data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-500/40"
                  />
                  <AvatarFallback className="rounded-full">
                    <QuillScribeProfileIcon />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-xs max-w-[166px]">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {subscription?.status === "active" ? (
                <DropdownMenuItem
                  disabled={loadingPortal}
                  onSelect={redirectToCustomerPortal}
                  className="focus:bg-sidebar-accent text-sidebar-foreground focus:text-sidebar-accent-foreground"
                >
                  <CreditCard />
                  {loadingPortal ? "Processing..." : "Billing & Plan"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => setSubscriptionModalOpen(true)}
                  className="focus:bg-sidebar-accent text-sidebar-foreground focus:text-sidebar-accent-foreground"
                >
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => setIsUserModalOpen(true)}
                className="focus:bg-sidebar-accent text-sidebar-foreground focus:text-sidebar-accent-foreground"
              >
                <BadgeCheck />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogoutButton className="w-full">
              <DropdownMenuItem className="focus:bg-sidebar-accent text-sidebar-foreground focus:text-sidebar-accent-foreground">
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserModal open={isUserModalOpen} onOpenChange={setIsUserModalOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
