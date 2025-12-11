"use client";

import { Session, type AuthUser } from "@supabase/supabase-js";
import { type Subscription, type User } from "../supabase/supabase.types";
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useAppStoreActions } from "../stores/app-store";
import { stringToColor } from "../color-generator";

const UNPROTECTED_ROUTES = ["/", "/login", "/signup"];

type SupabaseUser = (AuthUser & User) | null;

type SupabaseUserContextType = {
  user: SupabaseUser;
  syncUser: (session: Session | null) => Promise<void>;
  logout: () => Promise<void>;
  subscription: Subscription | null;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  syncUser: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  subscription: null,
});

export const useSupabaseUser = () => {
  return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
  children: ReactNode;
}

export const SupabaseUserProvider: FC<SupabaseUserProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<SupabaseUser>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { resetStore } = useAppStoreActions();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const supabase = createClientComponentClient();

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const handleSyncCleanup = useCallback(
    (withStoreCleanup: boolean = false) => {
      setUser(null);
      setSubscription(null);
      if (withStoreCleanup) {
        resetStore();
      }
      if (!UNPROTECTED_ROUTES.includes(pathnameRef.current))
        setTimeout(() => (window.location.href = "/login"), 0);
    },
    [resetStore]
  );

  const syncUser = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        return handleSyncCleanup(true);
      }

      try {
        const [userRes, subRes] = await Promise.all([
          fetch(`/api/users/${session.user.id}`, {
            credentials: "include",
          }),
          fetch("/api/subscription/status", {
            credentials: "include",
          }),
        ]);

        const completeUser = await userRes.json();
        const subscription = await subRes.json();

        if (completeUser && "error" in completeUser)
          throw new Error(completeUser.error);
        if (subscription && "error" in subscription)
          throw new Error(subscription.error);

        setUser({ ...session.user, ...completeUser });
        setSubscription(subscription);

        document.documentElement.style.setProperty(
          "--selection-color",
          stringToColor(session.user.id)
        );
      } catch {
        return handleSyncCleanup();
      }
    },
    [handleSyncCleanup]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
  }, [supabase]);

  // subscribe to auth state
  useEffect(() => {
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session);
    });

    return () => authListener.unsubscribe();
  }, [supabase, syncUser]);

  const contextValue = useMemo(
    () => ({ user, syncUser, logout, subscription }),
    [user, syncUser, logout, subscription]
  );

  return (
    <SupabaseUserContext.Provider value={contextValue}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
