"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ChevronRight,
  Zap,
  Search,
  Crosshair,
  Bookmark,
  Kanban,
  LineChart,
  Settings2,
  Shield,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-background transition-all duration-500 ease-in-out shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b border-border transition-all duration-500 overflow-hidden",
        collapsed ? "justify-center px-0" : "px-6 gap-3"
      )}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden transition-transform hover:scale-105 active:scale-95 cursor-pointer">
          <img src="/logo.svg" alt="drafted.jobs" className="size-[100%] object-contain" />
        </div>
        {!collapsed && (
          <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500">
            drafted.jobs
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto no-scrollbar">
        <div className="flex-1 space-y-4 py-6 px-0">
          <div className="space-y-1">
            <NavItem label="Overview" icon={<LayoutDashboard size={18} />} active={pathname === "/"} href="/" collapsed={collapsed} />
            <NavItem label="Career Search" icon={<Search size={18} />} active={pathname === "/drafting"} href="/drafting" collapsed={collapsed} />
            <NavItem label="Job Vault" icon={<Bookmark size={18} />} active={pathname === "/vault"} href="/vault" collapsed={collapsed} />
            <NavItem label="Pipeline" icon={<Kanban size={18} />} active={pathname === "/board"} href="/board" collapsed={collapsed} />
            <NavItem label="My Profile" icon={<Brain size={18} />} active={pathname === "/profile"} href="/profile" collapsed={collapsed} />
          </div>

          <div className="pt-4">
            <h3 className={cn(
              "text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-2 transition-opacity duration-300",
              collapsed ? "opacity-0" : "opacity-100"
            )}>
              Activity
            </h3>
            <div className="space-y-1">
              <NavItem label="Updates" icon={<LineChart size={18} />} active={pathname === "/logs"} href="/logs" collapsed={collapsed} />
              <NavItem label="Preferences" icon={<Settings2 size={18} />} active={pathname === "/settings"} href="/settings" collapsed={collapsed} />
            </div>
          </div>
        </div>

        {/* System Health */}
        {!collapsed && (
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Search Status</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-green-500/40" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-bold text-muted-foreground">Search Engine Active</span>
                   <span className="text-[9px] font-black text-primary uppercase">92%</span>
                </div>
                <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[92%]" />
                </div>
              </div>
              <button className="w-full py-2 bg-muted hover:bg-muted/80 text-[10px] font-black text-foreground uppercase tracking-widest rounded-lg border border-border/60 transition-colors">
                VIEW FULL STATUS
              </button>
            </div>
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Search Engines Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Looking through 4 major job sites...</p>
          </div>
        </div>
      )}
    </aside>
  );
}

// The original SidebarItem component is no longer used in the Sidebar's navigation structure
// but is kept here as per the instruction to not make unrelated edits outside the specified change.
// If NavItem is intended to replace SidebarItem entirely, this component could be removed or renamed.
function NavItem({ icon, label, href, active, collapsed, badge }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center transition-all duration-300 group relative",
        active
          ? "text-foreground font-black"
          : "text-muted-foreground hover:text-foreground",
        collapsed
          ? "justify-center h-12 w-full px-2" // Added horizontal padding
          : "justify-between px-4 py-3 rounded-xl hover:bg-muted/50"
          
      )}
    >
      <div className={cn(
        "flex items-center z-10",
        collapsed ? "justify-center" : "gap-3"
     
      )}>
        <div className={cn(
          "transition-all duration-300",
          active ? "text-primary scale-110" : "group-hover:text-foreground",
          collapsed && "flex items-center justify-center"
        )}>
          {icon}
        </div>
        {!collapsed && <span className="text-[11px] uppercase tracking-widest">{label}</span>}
      </div>

      {/* Active Indicator / Background */}
      {active && (
        <div className={cn(
          "absolute bg-muted border border-border/60  w-[100%] shadow-inner z-0 transition-all duration-300",
          collapsed
            ? "inset-0 px-3 pl-1 rounded-lg" // Tightened the inset for collapsed mode
            : "inset-0 rounded-xl"
        )} />
      )}

      {/* Tooltip for Collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 z-[9999] bg-popover text-popover-foreground text-[10px] font-black uppercase tracking-widest rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
           {label}
        </div>
      )}

      {!collapsed && badge && (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black pointer-events-none">
          {badge}
        </Badge>
      )}

      {/* Fixed Side Indicator - Only shows when NOT collapsed or styled as a subtle glow */}
      {active && !collapsed && (
        <div className="absolute right-2 w-1 h-4 bg-primary rounded-full opacity-50" />
      )}
    </Link>
  );
}