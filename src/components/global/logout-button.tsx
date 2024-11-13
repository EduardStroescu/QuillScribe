"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";

interface LogoutButtonProps {
  children: React.ReactNode;
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ children, className }) => {
  const { dispatch } = useAppState();
  const { setUser } = useSupabaseUser();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: "SET_WORKSPACES", payload: { workspaces: [] } });
    setUser(null);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("p-0", className)}
      onClick={logout}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;
