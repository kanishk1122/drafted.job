"use client";

import React from "react";
import { ShieldCheck, ArrowUpRight, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/redux/store";
import { fetchProfile, updatePlatformStatus } from "@/lib/redux/slices/profileSlice";
import { toast } from "sonner";
import Link from "next/link";

interface SearchChannel {
  id: number;
  name: string;
  key: string;
  logo: string;
  status: string;
  color: string;
  url: string;
}

export const platformTargets: SearchChannel[] = [
  { 
    id: 1, 
    name: "LinkedIn India", 
    key: "linkedin",
    logo: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=128", 
    status: "Premium Active", 
    color: "blue", 
    url: "https://www.linkedin.com/jobs/", 
  },
  { 
    id: 2, 
    name: "Naukri.com", 
    key: "naukri",
    logo: "https://www.google.com/s2/favicons?domain=naukri.com&sz=128", 
    status: "Direct Scan Ready", 
    color: "orange", 
    url: "https://www.naukri.com/", 
  },
  { 
    id: 3, 
    name: "Indeed India", 
    key: "indeed",
    logo: "https://www.google.com/s2/favicons?domain=indeed.com&sz=128", 
    status: "High Volume", 
    color: "blue", 
    url: "https://in.indeed.com/", 
  },
  { 
    id: 4, 
    name: "Foundit (Monster)", 
    key: "foundit",
    logo: "https://www.google.com/s2/favicons?domain=foundit.in&sz=128", 
    status: "AI Optimized", 
    color: "green", 
    url: "https://www.foundit.in/", 
  },
  { 
    id: 5, 
    name: "Glassdoor", 
    key: "glassdoor",
    logo: "https://www.google.com/s2/favicons?domain=glassdoor.com&sz=128", 
    status: "Insights Hub", 
    color: "green", 
    url: "https://www.glassdoor.co.in/", 
  },
  { 
    id: 6, 
    name: "AmbitionBox", 
    key: "ambitionbox",
    logo: "https://www.google.com/s2/favicons?domain=ambitionbox.com&sz=128", 
    status: "Review Scan", 
    color: "orange", 
    url: "https://www.ambitionbox.com/", 
  },
];

export function PlatformListItem({ platform }: { platform: SearchChannel }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth);
  const context = useAppSelector((state: RootState) => state.profile.context);
  const connected = (context as any)?.[`${platform.key}_active`] || false;
  const [localLoading, setLocalLoading] = React.useState(false);

  const handleToggle = async (checked: boolean) => {
    setLocalLoading(true);
    try {
      await dispatch(updatePlatformStatus({ platform: platform.key, active: checked })).unwrap();
      toast.success(`${platform.name} status updated.`);
    } catch (err: any) {
      toast.error(`Sync Failed: Platform module unreachable.`);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleNavigate = async () => {
    if (!connected) return;
    
    // NATIVE PERFORMANCE PIVOT: If in Electron, launch profile LOCALLY for speed
    if (typeof window !== 'undefined' && (window as any).electron) {
      try {
        await (window as any).electron.invoke('launch-browser', {
          userId: user.userEmail as string,
          url: platform.url,
          platform: platform.key
        });
        toast.success(`Locally launched ${platform.name} profile.`);
        return;
      } catch (err) {
        console.error("Local launch failed, falling back to server command.");
      }
    }

    // SERVER FALLBACK: Command the remote AI profile if local launch isn't possible
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/browser/navigate?platform=${platform.key}&url=${platform.url}`, {
        method: 'POST'
      });
      if (!resp.ok) throw new Error("Navigation failed");
      toast.success(`AI dispatched to ${platform.name} profile.`);
    } catch (err) {
      toast.error("Bridge Connection Lost: Ensure Chrome is open in Connect mode.");
    }
  };

  return (
    <div className={cn(
      "p-3 sm:p-4 group transition-all duration-300 flex items-center justify-between gap-2 overflow-hidden",
      connected ? "bg-primary/[0.02]" : "opacity-60 hover:opacity-100"
    )}>
       <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className={cn("h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-lg border border-border/40 overflow-hidden flex items-center justify-center transition-all duration-500 bg-white p-1", 
             connected ? "grayscale-0 ring-1 ring-primary/20 shadow-lg shadow-primary/10" : "grayscale opacity-40")}>
             <img src={platform.logo} alt={platform.name} className="size-full object-contain" />
          </div>
          <div className="min-w-0">
             <div className="flex items-center gap-1.5 overflow-hidden">
                <h3 className={cn("text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors truncate", 
                  connected ? "text-foreground" : "text-muted-foreground")}>
                  {platform.name}
                </h3>
                {connected && <ShieldCheck size={9} className="text-primary animate-pulse shrink-0" />}
             </div>
             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 truncate">
                {localLoading ? "Connecting..." : (connected ? platform.status : "OFFLINE")}
             </p>
          </div>
       </div>

       <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <button 
             onClick={handleNavigate}
             className={cn("flex items-center gap-1.5 text-[9px] font-black text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase", !connected && "pointer-events-none opacity-20")}>
             <span className="hidden lg:inline">Go to Site</span> 
             <ArrowUpRight size={11} className={cn(connected && "text-primary")} />
          </button>
          <Switch 
            checked={connected} 
            disabled={localLoading}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-primary scale-[0.6] sm:scale-75 cursor-pointer"
          />
       </div>
    </div>
  );
}

export function PlatformList() {
  const dispatch = useAppDispatch();
  const context = useAppSelector((state: RootState) => state.profile.context);

  React.useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const activeTargets = platformTargets.filter(p => (context as any)?.[`${p.key}_active`]);

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-border/20 max-h-[350px] overflow-y-auto">
        {activeTargets.length > 0 ? (
          activeTargets.map((platform) => (
            <PlatformListItem key={platform.id} platform={platform} />
          ))
        ) : (
          <div className="p-10 text-center space-y-3">
             <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto opacity-40">
                <ShieldCheck size={20} className="text-muted-foreground" />
             </div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
               No Active Sectors<br/>Verified on Chrome
             </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/20 bg-muted/10">
        <Link href="/connect" className="w-full cursor-pointer">
           <button className="w-full h-11 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group text-primary cursor-pointer">
              <Plus size={14} className="group-hover:rotate-90 transition-transform" />
              Add Platform
           </button>
        </Link>
      </div>
    </div>
  );
}
