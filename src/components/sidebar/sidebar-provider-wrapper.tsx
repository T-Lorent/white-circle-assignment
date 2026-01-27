"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

interface SidebarProviderWrapperProps {
  children: React.ReactNode;
}

export function SidebarProviderWrapper({
  children,
}: SidebarProviderWrapperProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <main className="flex-1 overflow-hidden h-screen">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
