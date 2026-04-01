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
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden transition-colors duration-500">
      {/* Sidebar Component stays fixed */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Navbar stays fixed at top */}
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* Main content - we'll let components handle their own scrolling if needed,
            but for a standard dashboard, we'll use a standard auto-y scroll for flexibility */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="max-w-[1600px] mx-auto min-h-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
