"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  Search,
  Zap,
  User,
  Activity,
  ChevronRight,
  Menu,
  ShieldCheck,
  Settings,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useTheme } from "next-themes";
import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';

import { useSelector, useDispatch } from "react-redux";
import { RootState, useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { authService } from "@/lib/services/auth-service";
import { logout } from "@/lib/redux/slices/authSlice";
import { fetchNotifications, markAsRead, markAllAsRead } from "@/lib/redux/slices/notificationSlice";
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const { fullName, userEmail } = useAppSelector((state: RootState) => state.auth);
  const { items: notifications, unreadCount, loading: notificationsLoading } = useAppSelector((state: RootState) => state.notification);
  
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [avatarSvg, setAvatarSvg] = React.useState("");
  const profileRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (userEmail) {
      dispatch(fetchNotifications() as any);
      
      // Optional: Poll for new notifications every minute
      const interval = setInterval(() => {
        dispatch(fetchNotifications() as any);
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [userEmail, dispatch]);

  React.useEffect(() => {
    const avatar = createAvatar(notionists, {
      "seed": fullName || userEmail || "professional",
      "radius": 10,
    });
    setAvatarSvg(avatar.toString());
  }, [fullName, userEmail]);

  // Handle click outside to close dropdowns
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    if (profileOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen, notificationsOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      setProfileOpen(false);
    } catch (error) {
      console.error("Logout failure:", error);
      dispatch(logout()); // Ensure local logout even if API fails
      setProfileOpen(false);
    }
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl z-20 shrink-0 sticky top-0 transition-all duration-500 ease-in-out">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu size={20} />
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
          <span className="hover:text-muted-foreground cursor-pointer transition-colors uppercase tracking-tight font-black text-[10px]">Menu</span>
          <ChevronRight size={14} className="opacity-20" />
          <span className="text-foreground uppercase tracking-tight font-black text-[10px]">Your Feed</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground flex items-center justify-center relative h-9 w-9"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 duration-500" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 duration-500" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Link href="/drafting?initiate=true" passHref>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden lg:flex border-border bg-muted/40 hover:bg-muted text-xs font-bold gap-2 tracking-tight"
            >
              <Plus size={14} /> NEW SEARCH
            </Button>
          </Link>

          {/* Notifications Panel */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn(
                "text-muted-foreground hover:text-foreground relative transition-all",
                notificationsOpen && "bg-muted text-foreground"
              )}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-primary rounded-full outline outline-2 outline-background animate-pulse"></span>
              )}
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                     <span 
                       onClick={() => dispatch(markAllAsRead() as any)}
                       className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                     >
                        {unreadCount} NEW - MARK ALL READ
                     </span>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40 thin-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">No new alerts</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) dispatch(markAsRead(notif.id) as any);
                        }}
                        className={cn(
                          "p-4 hover:bg-muted/30 transition-colors cursor-pointer group",
                          !notif.is_read && "bg-primary/[0.02]"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded flex items-center justify-center shrink-0",
                            notif.type === 'discovery' ? "bg-primary/10 text-primary" : 
                            notif.type === 'error' ? "bg-red-500/10 text-red-500" :
                            notif.type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                            "bg-blue-500/10 text-blue-500"
                          )}>
                            {notif.type === 'discovery' ? <Zap size={14} /> : 
                             notif.type === 'error' ? <Bell size={14} /> :
                             <Activity size={14} />}
                          </div>
                          <div className="space-y-1">
                            <p className={cn("text-xs font-bold leading-tight uppercase", !notif.is_read ? "text-foreground" : "text-muted-foreground")}>
                              {notif.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[9px] text-muted-foreground/50 font-mono">
                              {formatDistanceToNow(new Uint8Array(new TextEncoder().encode(notif.created_at))).replace('about ', '')} ago
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* <button 
                  onClick={() => {
                    window.location.href = '/logs';
                    setNotificationsOpen(false);
                  }}
                  className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted border-t border-border/60 transition-all text-center"
                >
                  VIEW ALL ACTIVITY
                </button> */}
              </div>
            )}
          </div>

          {/* User Profile Hook */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="h-9 w-9 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-bold ring-2 ring-background overflow-hidden font-mono hover:ring-primary/40 transition-all shadow-xl group"
            >
              <div 
                className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-110"
                dangerouslySetInnerHTML={{ __html: avatarSvg }}
              />
            </button>
            
            {profileOpen && (
              <>
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200">
                   <div className="px-3 py-2 border-b border-border/50 mb-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-md overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: avatarSvg }}
                        />
                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest truncate">{fullName || 'Professional'}</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground/60 font-medium truncate italic">{userEmail}</p>
                   </div>
                   <button 
                     onClick={() => setProfileOpen(false)}
                     className="w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-tight hover:bg-muted transition-colors flex items-center gap-2"
                   >
                      <User size={14} /> My Profile
                   </button>
                   <button 
                     onClick={() => setProfileOpen(false)}
                     className="w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-tight hover:bg-muted transition-colors flex items-center gap-2"
                   >
                      <Activity size={14} /> My Progress
                   </button>
                   <button 
                     onClick={() => setProfileOpen(false)}
                     className="w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-tight hover:bg-muted transition-colors flex items-center gap-2"
                   >
                      <Settings size={14} /> Settings
                   </button>
                   <div className="h-px bg-border/50 my-1" />
                   <button 
                     onClick={handleLogout}
                     className="w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-tight hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                   >
                      Log Out
                   </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
