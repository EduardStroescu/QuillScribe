import React from "react";
import { Subscription } from "@/lib/supabase/supabase.types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import db from "@/lib/supabase/db";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import QuillScribeProfileIcon from "../icons/quillScribeProfileIcon";
import ModeToggle from "../global/mode-toggle";
import { LogOut } from "lucide-react";
import LogoutButton from "../global/logout-button";

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard: React.FC<UserCardProps> = async ({ subscription }) => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, user.id),
  });
  let avatarPath;
  if (!response) return;
  if (!response.avatarUrl) avatarPath = "";
  else {
    avatarPath = supabase.storage
      .from("avatars")
      .getPublicUrl(response.avatarUrl)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article
      className="
      flex 
      justify-between 
      items-center 
      px-2 
      py-2 
      bg-primary
      dark:bg-primary-purple-900
      rounded-3xl
  "
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={profile.avatarUrl} alt="User Avatar" />
          <AvatarFallback>
            <QuillScribeProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-[#f9fafb]">
            {subscription?.status === "active" ? "Pro Plan" : "Free Plan"}
          </span>
          <small
            className="
            w-[100px] 
            overflow-hidden 
            overflow-ellipsis
            text-[#cac2ff]
          "
          >
            {profile.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center gap-1">
        <LogoutButton className="text-primary-foreground hover:text-foreground dark:text-inherit hover:dark:text-accent-foreground">
          <LogOut />
        </LogoutButton>
        <ModeToggle />
      </div>
    </article>
  );
};

export default UserCard;
