"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCcw, 
  ArrowRight,
  Fingerprint,
  Link2,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { browserApiService } from "@/lib/services/browser-api-service";
import { toast } from "sonner";

const PLATFORM_CONFIG = [
  { 
    id: "linkedin", 
    name: "LinkedIn India", 
    key: "linkedin",
    icon: <Link2 className="text-[#0A66C2]" />,
    description: "Direct access to high-tier corporate listings.",
    url: "https://www.linkedin.com/jobs/"
  },
  { 
    id: "naukri", 
    name: "Naukri.com", 
    key: "naukri",
    icon: <img src="https://www.naukri.com/favicon.ico" className="w-5 h-5 rounded-sm" alt="Naukri" />,
    description: "Main source for Indian tech market intelligence.",
    url: "https://www.naukri.com/"
  },
  { 
    id: "indeed", 
    name: "Indeed India", 
    key: "indeed",
    icon: <img src="https://www.indeed.com/favicon.ico" className="w-5 h-5" alt="Indeed" />,
    description: "Aggregated high-volume job discovery engine.",
    url: "https://in.indeed.com/"
  },
  { 
    id: "foundit", 
    name: "Foundit (Monster)", 
    key: "foundit",
    icon: <Globe className="text-purple-500" />,
    description: "AI-optimized search for mid-senior roles.",
    url: "https://www.foundit.in/"
  },
  { 
    id: "glassdoor", 
    name: "Glassdoor", 
    key: "glassdoor",
    icon: <img src="https://www.glassdoor.com/favicon.ico" className="w-5 h-5" alt="Glassdoor" />,
    description: "Insights and direct application hub.",
    url: "https://www.glassdoor.co.in/"
  },
  { 
    id: "ambitionbox", 
    name: "AmbitionBox", 
    key: "ambitionbox",
    icon: <RefreshCcw className="text-blue-400" />,
    description: "Detailed company review and culture scan.",
    url: "https://www.ambitionbox.com/"
  },
];

export default function ConnectPage() {
  const dispatch = useAppDispatch();
  const context = useAppSelector((state: RootState) => state.profile.context);
  const user = useAppSelector((state: RootState) => state.auth);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const [verifying, setVerifying] = useState<string | null>(null);

  const checkStatus = async (platformId: string, key: string) => {
    if (!user.userEmail) return;
    setVerifying(platformId);
    try {
      const res = await browserApiService.checkSession(user.userEmail, key);
      if (res.active) {
        toast.success(`${key} session verified! Status updated to READY.`);
        // 🔄 Sync DB state with Redux
        dispatch(fetchProfile());
      } else {
        toast.error(`No active ${key} session found. Please login in the Chrome window.`);
      }
    } catch (err) {
      toast.error("Status check failed. Ensure the local browser is still open.");
    } finally {
      setVerifying(null);
    }
  };

  const handleConnect = async (platformId: string, key: string) => {
    if (!user.userEmail) {
      toast.error("Account session required for profile setup.");
      return;
    }
    
    setConnecting(platformId);
    
    const platformUrls: any = {
      "linkedin": "https://www.linkedin.com/login",
      "naukri": "https://www.naukri.com/nlogin/login",
      "indeed": "https://in.indeed.com/account/login",
      "foundit": "https://www.foundit.in/login",
      "glassdoor": "https://www.glassdoor.co.in/profile/login_input.htm",
      "ambitionbox": "https://www.ambitionbox.com/login",
    };

    const url = platformUrls[key] || "https://www.google.com";

    // 🛡️ SECURITY UPGRADE: If running in Electron, launch locally for total isolation
    if ((window as any).electron) {
      toast.info(`Launching local browser for ${key}...`);
      try {
        await (window as any).electron.invoke('launch-browser', { 
            userId: user.userEmail, 
            url, 
            platform: key 
        });
        toast.success(`Local ${key} panel active. Profile is stored on your device.`);
        
        // Start auto-verification after 15 seconds
        setTimeout(() => checkStatus(platformId, key), 15000);
      } catch (err) {
        toast.error("Local launch failed. Are you in the desktop app?");
      }
    } else {
      // Fallback (Legacy/Server)
      toast.info(`Initializing Server-bound context for ${key}...`);
      try {
        await browserApiService.connectProfile(user.userEmail, key);
        toast.success(`${key} session process started on backend.`);
      } catch (err: any) {
        toast.error("Hardware initialization failed. Ensure backend has browser drivers.");
      }
    }
    
    setTimeout(() => setConnecting(null), 3000);
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
                Chrome Instance: {user.userEmail || "Guest"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Connection <span className="text-primary italic">Center</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium max-w-xl">
              Each user manages a single persistent Chrome profile. Log in once for each platform to enable 
              automated scouting and direct application synchronization.
            </p>
          </div>

          <div className="flex gap-3">
             <Button 
              onClick={() => dispatch(fetchProfile())}
              variant="outline" className="h-12 px-6 rounded-xl border-border bg-muted/30 hover:bg-muted font-black tracking-widest text-[11px] uppercase">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Status
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
                    +1
                </div>
            </div>
            
            <div className="flex-1 space-y-1 z-10 text-center md:text-left">
                <h3 className="text-sm font-black uppercase tracking-tight">Active Automation Pool</h3>
                <p className="text-xs text-muted-foreground font-medium">
                   Your account is currently managing <strong>1 isolated Chrome profile</strong>. 
                   Platform credentials remain sandboxed on your backend server.
                </p>
            </div>
            
            <Button variant="outline" className="rounded-xl h-12 px-8 font-black tracking-widest text-[11px] uppercase z-10 border-primary/20 text-primary">
                PROFILES SECURED
            </Button>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_CONFIG.map((platform) => {
            const isActive = (context as any)?.[`${platform.key}_active`] || false;
            const userPlatformEmail = (context as any)?.[`${platform.key}_email`];
            
            return (
              <div 
                key={platform.id}
                className={cn(
                  "group relative p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden",
                  isActive 
                    ? "bg-muted/30 border-primary/20" 
                    : "bg-background border-border hover:border-primary/40"
                )}
              >
                {/* Status Glow */}
                {isActive && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-[30px] group-hover:scale-150 transition-transform duration-700" />
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                    {platform.icon}
                  </div>
                  <div className="flex items-center gap-1">
                     {isActive ? (
                       <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black px-2 py-0">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          READY
                       </Badge>
                     ) : (
                       <Badge variant="outline" className="text-muted-foreground border-border text-[9px] font-black px-2 py-0 uppercase">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          OFFLINE
                       </Badge>
                     )}
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <div className="flex items-center gap-2">
                     <h3 className="text-lg font-black tracking-tight">{platform.name}</h3>
                     {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {isActive ? "SESSION ACTIVE" : "CONNECTION REQUIRED"}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-6 min-h-[32px]">
                  {platform.description}
                </p>

                <div className="pt-6 border-t border-border/60 flex items-center justify-between">
                  <div>
                     {isActive ? (
                       <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Identity Pool</span>
                          <p className="text-[10px] font-bold truncate max-w-[120px]">{userPlatformEmail || user.userEmail}</p>
                       </div>
                     ) : (
                       <span className="text-[10px] font-bold text-muted-foreground italic">Launch setup to link</span>
                     )}
                  </div>

                  {isActive ? (
                     <Button 
                      asChild
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:translate-x-1"
                     >
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                     </Button>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                       <button 
                        onClick={() => handleConnect(platform.id, platform.key)}
                        disabled={connecting === platform.id || verifying === platform.id}
                        className="h-10 px-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all bg-primary text-primary-foreground hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                       >
                         {connecting === platform.id ? "LAUNCHING..." : (
                            <>
                               CONNECT <ArrowRight className="w-3 h-3 ml-2" />
                            </>
                         )}
                       </button>
                       
                       <Button 
                        variant="ghost"
                        size="sm"
                        disabled={verifying === platform.id || connecting === platform.id}
                        onClick={() => checkStatus(platform.id, platform.key)}
                        className="h-8 rounded-lg font-black text-[9px] tracking-tighter uppercase border border-border/40 hover:bg-muted"
                       >
                         {verifying === platform.id ? (
                           <RefreshCcw className="w-3 h-3 mr-2 animate-spin" />
                         ) : (
                           <ShieldCheck className="w-3 h-3 mr-2" />
                         )}
                         {verifying === platform.id ? "VERIFYING..." : "VERIFY SESSION"}
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
