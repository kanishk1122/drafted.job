"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCcw, 
  UserPlus,
  ArrowRight,
  Fingerprint,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  email?: string;
  description: string;
  statusText: string;
}

export default function ConnectPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "linkedin",
      name: "LinkedIn India",
      icon: <Link2 className="text-[#0A66C2]" />,
      active: true,
      email: "professional.user@example.com",
      description: "Direct access to high-tier corporate listings.",
      statusText: "PREMIUM ACTIVE"
    },
    {
      id: "naukri",
      name: "Naukri.com",
      icon: <img src="https://www.naukri.com/favicon.ico" className="w-5 h-5 rounded-sm" />,
      active: true,
      email: "user_profile_main@naukri.in",
      description: "Main source for Indian tech market intelligence.",
      statusText: "DIRECT SCAN READY"
    },
    {
      id: "indeed",
      name: "Indeed India",
      icon: <img src="https://www.indeed.com/favicon.ico" className="w-5 h-5" />,
      active: false,
      description: "Aggregated high-volume job discovery engine.",
      statusText: "CONNECTION REQUIRED"
    },
    {
      id: "foundit",
      name: "Foundit (Monster)",
      icon: <Globe className="text-purple-500" />,
      active: true,
      email: "career.hunter@foundit.com",
      description: "AI-optimized search for mid-senior roles.",
      statusText: "AI OPTIMIZED"
    },
    {
       id: "glassdoor",
       name: "Glassdoor",
       icon: <img src="https://www.glassdoor.com/favicon.ico" className="w-5 h-5" />,
       active: true,
       description: "Insights and direct application hub.",
       statusText: "INSIGHTS HUB"
    },
    {
       id: "ambitionbox",
       name: "AmbitionBox",
       icon: <RefreshCcw className="text-blue-400" />,
       active: false,
       description: "Detailed company review and culture scan.",
       statusText: "RESCAN NEEDED"
    }
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    setConnecting(id);
    // Simulate connection logic
    setTimeout(() => {
      setPlatforms(prev => prev.map(p => 
        p.id === id ? { ...p, active: true, statusText: "CONNECTED" } : p
      ));
      setConnecting(null);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px] font-black tracking-widest border-primary/30 text-primary uppercase">
                Profile Guard Active
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Connection <span className="text-primary italic">Center</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium max-w-xl">
              Manage your persistent Chrome profiles. Log in once for each platform to enable 
              automated scouting and direct application synchronization.
            </p>
          </div>

          <div className="flex gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-xl border-border bg-muted/30 hover:bg-muted font-black tracking-widest text-[11px] uppercase">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Sync All Profiles
             </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-32 translate-x-32" />
            
            <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden z-10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="User" />
                    </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-background bg-primary text-primary-foreground flex items-center justify-center font-black text-xs z-10">
                    +12
                </div>
            </div>
            
            <div className="flex-1 space-y-1 z-10 text-center md:text-left">
                <h3 className="text-sm font-black uppercase tracking-tight">Active Automation Pool</h3>
                <p className="text-xs text-muted-foreground font-medium">
                   Your account is currently managing <strong>{platforms.length} browser profiles</strong>. 
                   Data stays isolated and secure within your encrypted vault.
                </p>
            </div>
            
            <Button className="rounded-xl h-12 px-8 font-black tracking-widest text-[11px] uppercase z-10">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Profile
            </Button>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div 
              key={platform.id}
              className={cn(
                "group relative p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer overflow-hidden",
                platform.active 
                  ? "bg-muted/30 border-primary/20" 
                  : "bg-background border-border hover:border-primary/40"
              )}
            >
              {/* Status Glow */}
              {platform.active && (
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-[30px] group-hover:scale-150 transition-transform duration-700" />
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {platform.icon}
                </div>
                <div className="flex items-center gap-1">
                   {platform.active ? (
                     <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black px-2 py-0">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        ACTIVE
                     </Badge>
                   ) : (
                     <Badge variant="outline" className="text-muted-foreground border-border text-[9px] font-black px-2 py-0 uppercase">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        DISCONNECTED
                     </Badge>
                   )}
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2">
                   <h3 className="text-lg font-black tracking-tight">{platform.name}</h3>
                   {platform.active && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {platform.statusText}
                </p>
              </div>

              <p className="text-xs text-muted-foreground font-medium mb-6 min-h-[32px]">
                {platform.description}
              </p>

              <div className="pt-6 border-t border-border/60 flex items-center justify-between">
                <div>
                   {platform.active ? (
                     <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Connected Account</span>
                        <p className="text-[10px] font-bold truncate max-w-[120px]">{platform.email}</p>
                     </div>
                   ) : (
                     <span className="text-[10px] font-bold text-muted-foreground italic">No session active</span>
                   )}
                </div>

                {platform.active ? (
                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:translate-x-1">
                      <ExternalLink className="w-4 h-4" />
                   </Button>
                ) : (
                   <Button 
                    onClick={() => handleConnect(platform.id)}
                    disabled={connecting === platform.id}
                    className="h-10 px-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                   >
                     {connecting === platform.id ? "SYNCING..." : (
                        <>
                           CONNECT <ArrowRight className="w-3 h-3 ml-2" />
                        </>
                     )}
                   </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Security Footer */}
        <div className="p-8 rounded-3xl bg-muted/20 border border-border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-background border border-border">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black uppercase text-sm italic italic">Industrial Grade Encryption</h4>
                    <p className="text-xs text-muted-foreground max-w-md font-medium">
                        Your browser profiles are stored in an encrypted persistent volume. 
                        We never store your passwords in plain text; only session cookies are handled by the browser agent.
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Global Security Status</span>
                <div className="flex gap-1.5 h-1">
                    {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className="w-6 h-full rounded-full bg-primary" />
                    ))}
                    <div className="w-6 h-full rounded-full bg-muted" />
                </div>
                <span className="text-[10px] font-black text-primary uppercase">Ultra Secure</span>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
