"use client";

import React from "react";
import { 
  Settings2, 
  Layout, 
  Bell, 
  ShieldCheck, 
  Zap, 
  Moon, 
  Sun, 
  Monitor,
  Sidebar as SidebarIcon,
  Eye,
  EyeOff,
  MousePointer2,
  Lock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { setSidebarMode, setNotificationsEnabled, setTheme as setReduxTheme } from "@/lib/redux/slices/uiSlice";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { sidebarMode, notificationsEnabled, theme: reduxTheme } = useAppSelector((state) => state.ui);
  const { setTheme: setNextTheme } = useTheme();

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    dispatch(setReduxTheme(newTheme));
    setNextTheme(newTheme);
    toast.success("VISUAL PROTOCOL UPDATED", {
      description: `System theme shifted to ${newTheme.toUpperCase()}.`
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground italic flex items-center gap-4">
              Preferences <Settings2 className="h-10 w-10 text-primary" />
           </h1>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Command Center Customization & Logic Protocols</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="h-8 px-4 border-primary/30 text-primary font-black uppercase text-[9px] tracking-widest bg-primary/5">
              VERSION 2.4.0-BETA
           </Badge>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left Column: Navigation & UI */}
        <div className="lg:col-span-8 space-y-8">
          
          <motion.div variants={item}>
            <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <CardHeader className="p-8 border-b border-border/20 bg-muted/20">
                <CardTitle className="text-[12px] font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                  <Layout className="h-4 w-4 text-primary" /> Navigation Control Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                
                <div className="space-y-6">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                         <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <SidebarIcon size={16} className="text-primary" /> Sidebar Operational Mode
                         </h3>
                         <p className="text-[11px] text-muted-foreground font-medium max-w-sm">Define how the primary navigation framework interacts with your workspace.</p>
                      </div>
                      <div className="flex bg-muted/30 p-1.5 rounded-2xl border-2 border-border/40 gap-1">
                         <ModeButton 
                           active={sidebarMode === 'default'} 
                           onClick={() => dispatch(setSidebarMode('default'))}
                           icon={<Eye size={12} />} 
                           label="FIXED" 
                         />
                         <ModeButton 
                           active={sidebarMode === 'mini'} 
                           onClick={() => dispatch(setSidebarMode('mini'))}
                           icon={<EyeOff size={12} />} 
                           label="MINI" 
                         />
                         <ModeButton 
                           active={sidebarMode === 'hover'} 
                           onClick={() => dispatch(setSidebarMode('hover'))}
                           icon={<MousePointer2 size={12} />} 
                           label="HOVER" 
                         />
                      </div>
                   </div>
                </div>

                <div className="h-px bg-border/20" />

                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <Bell size={16} className="text-primary" /> Global Notification Uplink
                         </h3>
                         <p className="text-[11px] text-muted-foreground font-medium max-w-sm">Enable real-time telemetry alerts for mission status and recruitment nodes.</p>
                      </div>
                      <Switch 
                        checked={notificationsEnabled} 
                        onCheckedChange={async (checked) => {
                          if (checked && "Notification" in window) {
                             const permission = await Notification.requestPermission();
                             if (permission !== "granted") {
                                toast.error("ACCESS DENIED", {
                                   description: "Please enable notifications in your browser settings."
                                });
                                return;
                             }
                          }
                          dispatch(setNotificationsEnabled(checked));
                          toast.success(checked ? "NOTIFICATIONS ENABLED" : "SILENT MODE ACTIVE", {
                            description: checked ? "Uplink established." : "Telemetry muted."
                          });
                        }} 
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/40 space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                               <ShieldCheck size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Security Access</span>
                         </div>
                         <p className="text-[10px] font-medium leading-relaxed text-muted-foreground uppercase opacity-80 italic">System notification permissions granted via Browser API.</p>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.div variants={item}>
            <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
               <CardHeader className="p-8 border-b border-border/20 bg-muted/20">
                  <CardTitle className="text-[10px] font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                    <Zap size={14} className="text-primary" /> Visual Protocols
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeButton active={reduxTheme === 'dark'} onClick={() => handleThemeChange('dark')} icon={<Moon size={16} />} />
                    <ThemeButton active={reduxTheme === 'light'} onClick={() => handleThemeChange('light')} icon={<Sun size={16} />} />
                    <ThemeButton active={reduxTheme === 'system'} onClick={() => handleThemeChange('system')} icon={<Monitor size={16} />} />
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                     <p className="text-[9px] font-black text-primary uppercase tracking-widest">Selected Mode: {reduxTheme.toUpperCase()}</p>
                     <p className="text-[10px] leading-relaxed text-muted-foreground italic font-medium">Automatic system synchronization optimized for maximum focus.</p>
                  </div>
               </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border-t-2 border-primary/20">
               <CardContent className="p-10 text-center space-y-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-muted/60 border-2 border-border/40 mx-auto flex items-center justify-center text-3xl font-black text-foreground">
                    C
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic">Root Administrator</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">System Security Clearance: LEVEL 4</p>
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-border font-black text-[10px] uppercase tracking-[0.3em] gap-2">
                     LOCK TERMINAL <Lock size={14} />
                  </Button>
               </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ModeButton({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
          : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      {icon} {label}
    </button>
  );
}

function ThemeButton({ active, icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "aspect-square flex items-center justify-center rounded-2xl border-2 transition-all",
        active 
          ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10 scale-110" 
          : "bg-muted/10 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {icon}
    </button>
  );
}
