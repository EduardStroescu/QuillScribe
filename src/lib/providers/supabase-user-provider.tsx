"use client";

import { type AuthUser } from "@supabase/supabase-js";
import { type Subscription, type User } from "../supabase/supabase.types";
import {
  createContext,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useAppStoreActions } from "../stores/app-store";
import { stringToColor } from "../color-generator";

const UNPROTECTED_ROUTES = ["/", "/login", "/signup"];

type SupabaseUser = (AuthUser & User) | null;

type SupabaseUserContextType = {
  user: SupabaseUser;
  setUser: Dispatch<SetStateAction<SupabaseUser>>;
  logout: () => Promise<void>;
  subscription: Subscription | null;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  setUser: () => {},
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
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    function handleDisconnect(withStoreCleanup: boolean = false) {
      setUser(null);
      setSubscription(null);
      if (withStoreCleanup) {
        resetStore();
      }
      if (!UNPROTECTED_ROUTES.includes(window.location.pathname))
        router.push("/login");
    }

    // subscribe to auth state
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
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
          handleDisconnect();
        }
      } else {
        // logged out
        handleDisconnect(true);
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  }, [supabase, resetStore, router]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
  }, [supabase]);

  const contextValue = useMemo(
    () => ({ user, setUser, logout, subscription }),
    [user, subscription, logout]
  );

  return (
    <SupabaseUserContext.Provider value={contextValue}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
