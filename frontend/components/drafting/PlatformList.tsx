"use client";

import React from "react";
import { Link2, Globe, Briefcase, Search, ExternalLink, Zap, ShieldCheck, ShieldAlert, ArrowUpRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const platformTargets = [
  { 
    id: 1, 
    name: "LinkedIn India", 
    logo: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=128", 
    status: "Premium Active", 
    color: "blue", 
    url: "https://www.linkedin.com/jobs/", 
    initiallyConnected: true 
  },
  { 
    id: 2, 
    name: "Naukri.com", 
    logo: "https://www.google.com/s2/favicons?domain=naukri.com&sz=128", 
    status: "Direct Scan Ready", 
    color: "orange", 
    url: "https://www.naukri.com/", 
    initiallyConnected: false 
  },
  { 
    id: 3, 
    name: "Indeed India", 
    logo: "https://www.google.com/s2/favicons?domain=indeed.com&sz=128", 
    status: "High Volume", 
    color: "blue", 
    url: "https://in.indeed.com/", 
    initiallyConnected: true 
  },
  { 
    id: 4, 
    name: "Foundit (Monster)", 
    logo: "https://www.google.com/s2/favicons?domain=foundit.in&sz=128", 
    status: "AI Optimized", 
    color: "green", 
    url: "https://www.foundit.in/", 
    initiallyConnected: false 
  },
  { 
    id: 5, 
    name: "Glassdoor", 
    logo: "https://www.google.com/s2/favicons?domain=glassdoor.com&sz=128", 
    status: "Insights Hub", 
    color: "green", 
    url: "https://www.glassdoor.co.in/", 
    initiallyConnected: false 
  },
  { 
    id: 6, 
    name: "AmbitionBox", 
    logo: "https://www.google.com/s2/favicons?domain=ambitionbox.com&sz=128", 
    status: "Review Scan", 
    color: "orange", 
    url: "https://www.ambitionbox.com/", 
    initiallyConnected: false 
  },
];

export function PlatformListItem({ platform }: any) {
  const [connected, setConnected] = React.useState(platform.initiallyConnected);
  
  return (
    <div className={cn(
      "p-4 group transition-all duration-300 flex items-center justify-between",
      connected ? "bg-primary/[0.02]" : "opacity-60 hover:opacity-100"
    )}>
       <div className="flex items-center gap-4">
          <div className={cn("h-8 w-8 rounded-lg border border-border/40 overflow-hidden flex items-center justify-center transition-all duration-500 bg-white p-1.5", 
             connected ? "grayscale-0 ring-1 ring-primary/20" : "grayscale opacity-40")}>
             <img src={platform.logo} alt={platform.name} className="size-full object-contain" />
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h3 className={cn("text-[11px] font-black uppercase tracking-widest transition-colors", 
                  connected ? "text-foreground" : "text-muted-foreground")}>
                  {platform.name}
                </h3>
                {connected && <ShieldCheck size={10} className="text-primary animate-pulse" />}
             </div>
             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {connected ? platform.status : "OFFLINE"}
             </p>
          </div>
       </div>

       <div className="flex items-center gap-5">
          <a href={platform.url} target="_blank" rel="noopener noreferrer" 
             className={cn("hidden sm:flex items-center gap-1.5 text-[9px] font-black text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase", !connected && "pointer-events-none opacity-20")}>
             Go to Site <ArrowUpRight size={10} />
          </a>
          <Switch 
            checked={connected} 
            onCheckedChange={setConnected}
            className="data-[state=checked]:bg-primary scale-75"
          />
       </div>
    </div>
  );
}
