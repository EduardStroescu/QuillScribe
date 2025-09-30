import Header from "@/components/landing-page/header";
import { SubscriptionModalProvider } from "@/lib/providers/subscription-modal-provider";
import { getActiveProductsWithPrice } from "@/lib/supabase/queries";
import { type ReactNode } from "react";

const HomePageLayout = async ({ children }: { children: ReactNode }) => {
  const { data: products } = await getActiveProductsWithPrice();

  return (
    <main>
      <Header />
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default HomePageLayout;
