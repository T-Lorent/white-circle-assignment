import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProviderWrapper } from "@/components/sidebar/sidebar-provider-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with Claude AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProviderWrapper>{children}</SidebarProviderWrapper>
      </body>
    </html>
  );
}
