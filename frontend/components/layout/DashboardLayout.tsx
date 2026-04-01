"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30  transition-colors duration-500">
      {/* Sidebar Component stays fixed */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full ">
        {/* Navbar stays fixed at top */}
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 relative overflow-y-scroll  flex flex-col">
          <div className="flex-1 w-full relative p-4 h-[calc(100vh-10rem)]">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
