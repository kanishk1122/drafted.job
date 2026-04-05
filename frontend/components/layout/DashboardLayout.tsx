"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { setSidebarMode } from "@/lib/redux/slices/uiSlice";
import { useNotificationSocket } from "@/lib/hooks/useNotificationSocket";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const dispatch = useAppDispatch();
  const { sidebarMode } = useAppSelector((state) => state.ui);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize real-time notification socket
  useNotificationSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Compute effective collapsed state based on Redux mode + local hover state
  const isCollapsed = sidebarMode === 'mini' || (sidebarMode === 'hover' && !isHovered);

  const handleToggle = () => {
    // Toggles between default (full) and mini (collapsed)
    const nextMode = sidebarMode === 'default' ? 'mini' : 'default';
    dispatch(setSidebarMode(nextMode));
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-500 overflow-hidden">
      {/* Sidebar Container with Hover-Reveal logic */}
      <div 
        onMouseEnter={() => sidebarMode === 'hover' && setIsHovered(true)}
        onMouseLeave={() => sidebarMode === 'hover' && setIsHovered(false)}
        className="h-full transition-all duration-500"
      >
        <Sidebar collapsed={isCollapsed} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full ">
        {/* Navbar with reactive toggler */}
        <Navbar onToggleSidebar={handleToggle} />
        
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1 w-full relative p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
