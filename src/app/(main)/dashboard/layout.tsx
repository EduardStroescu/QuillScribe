import { SubscriptionModalProvider } from "@/lib/providers/subscription-modal-provider";
import { getActiveProductsWithPrice } from "@/lib/supabase/queries";
import { Metadata } from "next";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

export const metadata: Metadata = {
  title: "Dashboard",
};

const Layout: React.FC<LayoutProps> = async ({ children }) => {
  const { data: products } = await getActiveProductsWithPrice();

  return (
    <main className="flex over-hidden h-screen">
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default Layout;
