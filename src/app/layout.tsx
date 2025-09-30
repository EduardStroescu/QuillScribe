import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
import { DM_Sans } from "next/font/google";
import { SupabaseUserProvider } from "@/lib/providers/supabase-user-provider";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/lib/providers/socket-provider";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "QuillScribe | %s",
    default: "QuillScribe | Home",
  },
  description: "Real-time text editor for collaborators.",
  creator: "Eduard Stroescu",
  keywords: "real-time, collaborators, text, editor",
  applicationName: "QuillScribe",
  icons: { icon: "/quillScribeFavicon.png" },
  openGraph: {
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: "QuillScribe",
    description: "Real-time text editor for collaborators.",
    siteName: "QuillScribe",
    images:
      "https://raw.githubusercontent.com/EduardStroescu/PubImages/main/WebsiteImages/quillScribe.jpg",
  },
  twitter: {
    card: "summary_large_image",
    site: process.env.NEXT_PUBLIC_SITE_URL,
    creator: "Eduard Stroescu",
    title: "QuillScribe",
    description: "Real-time text editor for collaborators.",
    images:
      "https://raw.githubusercontent.com/EduardStroescu/PubImages/main/WebsiteImages/quillScribe.jpg",
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_SITE_URL}`),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-background antialiased ${dmSans.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SupabaseUserProvider>
            <SocketProvider>
              {children}
              <Toaster />
            </SocketProvider>
          </SupabaseUserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
