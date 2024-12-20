"use client";

import { AuthUser } from "@supabase/supabase-js";
import { Subscription } from "../supabase/supabase.types";
import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getUserSubscriptionStatus } from "../supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";

type SupabaseUserContextType = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  subscription: Subscription | null;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  setUser: () => {},
  subscription: null,
});

export const useSupabaseUser = () => {
  return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
  children: React.ReactNode;
}

export const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  const supabase = createClientComponentClient();

  //Fetch the user details && subscriptions
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await getUserSubscriptionStatus(user.id);
        if (data) setSubscription(data);
        if (error) {
          toast({
            title: "Unexpected Error",
            description:
              "Opps! An unexpected error occurred. Please try again later.",
          });
        }
      }
    };

    if (
      !user &&
      pathname !== "/" &&
      pathname !== "/login" &&
      pathname !== "/signup"
    ) {
      getUser();
    }
  }, [pathname, user, supabase, toast]);

  return (
    <SupabaseUserContext.Provider value={{ user, setUser, subscription }}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
