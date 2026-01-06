import type { Metadata } from "next";
import "./globals.css";
import "@excalidraw/excalidraw/index.css";
import { TopNav } from "@/components/top-nav";
import { getCurrentSession } from "@/lib/auth";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ConditionalAIChatBubble } from "@/components/conditional-ai-chat-bubble";

export const metadata: Metadata = {
  title: "EduPlatform",
  description: "Nền tảng lớp học trực tuyến",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  const headersList = headers();
  const matchedPath =
    headersList.get("x-pathname") ||
    headersList.get("x-invoke-path") ||
    headersList.get("x-matched-path") ||
    "";
  const hideTopNav = matchedPath.startsWith("/auth");

  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {!hideTopNav && <TopNav user={session?.user ?? null} />}
        <div className={hideTopNav ? "" : "pt-20"}>{children}</div>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
        <ConditionalAIChatBubble />
      </body>
    </html>
  );
}
