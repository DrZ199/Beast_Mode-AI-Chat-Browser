import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeastMode - Autonomous AI Agent Platform",
  description: "Create intelligent AI agents that break down complex goals and execute them automatically. Your autonomous AI workforce in a browser.",
  keywords: ["BeastMode", "AI agents", "autonomous AI", "task automation", "OpenRouter", "Next.js", "TypeScript"],
  authors: [{ name: "BeastMode Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "BeastMode - Autonomous AI Agent Platform",
    description: "Your autonomous AI workforce. Create agents, set goals, and watch them execute tasks automatically.",
    url: "https://chat.z.ai",
    siteName: "BeastMode",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeastMode - Autonomous AI Agent Platform",
    description: "Your autonomous AI workforce. Create agents, set goals, and watch them execute tasks automatically.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
