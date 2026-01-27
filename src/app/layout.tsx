// STYLES
import "./globals.css";

// FONTS
import { Geist, Geist_Mono } from "next/font/google";

// LIBRARIES
import type { Metadata } from "next";

// UTILS
import { cn } from "@/lib/utils";

/*========== FONTS ==========*/
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*========== METADATA ==========*/
export const metadata: Metadata = {
  title: "White Circle AI",
  description: "A sensitive safe AI chat assistant",
};

/*========== MAIN LAYOUT ==========*/
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        {children}
      </body>
    </html>
  );
}
