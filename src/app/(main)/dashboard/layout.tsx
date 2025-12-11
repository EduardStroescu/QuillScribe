import { SubscriptionModalProvider } from "@/lib/providers/subscription-modal-provider";
import { getActiveProductsWithPrice } from "@/lib/supabase/queries";
import { Metadata } from "next";
import { type FC, type ReactNode } from "react";
import { SidebarOptions } from "@/components/sidebar/sidebar-options";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { QuillEditorProvider } from "@/lib/providers/quill-editor-provider";
import { cookies } from "next/headers";
import { SocketProvider } from "@/lib/providers/socket-provider";

interface LayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Dashboard",
};

const Layout: FC<LayoutProps> = async ({ children }) => {
  const { data: products } = await getActiveProductsWithPrice();
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SubscriptionModalProvider products={products}>
      <SocketProvider>
        <main className="flex overflow-hidden h-[100dvh] w-[100dvw]">
          <SidebarProvider defaultOpen={defaultOpen}>
            <QuillEditorProvider>
              <Sidebar variant="inset">
                <SidebarOptions />
              </Sidebar>
              <SidebarInset className="overflow-hidden">
                {children}
              </SidebarInset>
            </QuillEditorProvider>
          </SidebarProvider>
        </main>
      </SocketProvider>
    </SubscriptionModalProvider>
  );
};

export default Layout;
