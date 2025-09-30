"use client";

import { cn } from "@/lib/utils";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { type FC, type ReactNode } from "react";

interface LogoutButtonProps {
  children: ReactNode;
  className?: string;
}

const LogoutButton: FC<LogoutButtonProps> = ({ children, className }) => {
  const { logout } = useSupabaseUser();

  return (
    <button className={cn("p-0", className)} onClick={logout}>
      {children}
    </button>
  );
};

export default LogoutButton;
