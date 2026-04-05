"use client";
import React from "react";
import { Search, ArrowRight, X, Globe, Link2, MapPin, Target, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Full registry of supported platforms
const PLATFORM_REGISTRY: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  linkedin: { 
    name: "LinkedIn", 
    icon: <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" alt="LinkedIn" className="w-4 h-4 object-contain" />, 
    color: "text-[#0A66C2]" 
  },
  naukri: { 
    name: "Naukri", 
    icon: <img src="https://www.google.com/s2/favicons?domain=naukri.com&sz=128" alt="Naukri" className="w-4 h-4 object-contain" />, 
    color: "text-[#FF7555]" 
  },
  indeed: { 
    name: "Indeed", 
    icon: <img src="https://www.google.com/s2/favicons?domain=indeed.com&sz=128" alt="Indeed" className="w-4 h-4 object-contain" />, 
    color: "text-[#2164f3]" 
  },
  foundit: { 
    name: "Foundit", 
    icon: <img src="https://www.google.com/s2/favicons?domain=foundit.in&sz=128" alt="Foundit" className="w-4 h-4 object-contain" />, 
    color: "text-[#7B3FE4]" 
  },
  glassdoor: { 
    name: "Glassdoor", 
    icon: <img src="https://www.google.com/s2/favicons?domain=glassdoor.com&sz=128" alt="Glassdoor" className="w-4 h-4 object-contain" />, 
    color: "text-[#0CAA41]" 
  },
  ambitionbox: { 
    name: "AmbitionBox", 
    icon: <img src="https://www.google.com/s2/favicons?domain=ambitionbox.com&sz=128" alt="AmbitionBox" className="w-4 h-4 object-contain" />, 
    color: "text-[#1C4E80]" 
  },
};

interface InitiationViewProps {
  targetRole: string;
  setTargetRole: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  selectedPlatforms: string[];
  togglePlatform: (v: string) => void;
  activePlatforms: string[];  // from backend — only connected platforms
  onAbort: () => void;
  onExecute: () => void;
}

export function InitiationView({
  targetRole, setTargetRole,
  location, setLocation,
  selectedPlatforms, togglePlatform,
  activePlatforms,
  onAbort, onExecute
}: InitiationViewProps) {
  return (
    <motion.div
      key="search-initiation"
      initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto space-y-8 py-4 px-4"
    >
      {/* Header */}
      <div className="text-center space-y-3 shrink-0 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="flex justify-center mb-2 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-card border-2 border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center animate-pulse">
            <Search size={28} className="text-primary" />
          </div>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-foreground relative z-10">
          Start Search
        </h2>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] relative z-10">
          AI Assistant will find jobs for you
        </p>
      </div>

      {/* Control Panel */}
      <div className="w-full bg-card/30 backdrop-blur-xl border-2 border-border/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden group/panel">
        {/* Subtle Panel Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/panel:opacity-100 transition-duration-700 pointer-events-none" />

        {/* Target Role */}
        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Target Role <span className="text-primary">*</span>
          </label>
          <div className="relative group/input">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors duration-300" />
            <input
              autoFocus
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && targetRole.trim() && onExecute()}
              placeholder="e.g. Full Stack Developer, ML Engineer..."
              className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border/60 bg-background/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 placeholder:text-muted-foreground/30 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Location & Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Search Location
            </label>
            <div className="relative group/input">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors duration-300" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Remote..."
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border/60 bg-background/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 placeholder:text-muted-foreground/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Job Websites
            </label>
              <div className="flex flex-wrap gap-2.5 min-h-[3.5rem] p-2.5 rounded-xl border-2 border-border/60 bg-background/50">
                {Object.keys(PLATFORM_REGISTRY).map(pid => {
                  const cfg = PLATFORM_REGISTRY[pid];
                  const isActive = activePlatforms.includes(pid);
                  const isSelected = selectedPlatforms.includes(pid);

                  return (
                    <div key={pid} className="flex-1 min-w-[100px] flex flex-col gap-1">
                      <button
                        onClick={() => isActive ? togglePlatform(pid) : (window.location.href = "/connect")}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 h-11 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-300 border-2 relative cursor-pointer",
                          isActive 
                            ? isSelected 
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                              : "bg-background/40 text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/40"
                            : "bg-muted/10 text-muted-foreground/30 border-dashed border-border/20 grayscale opacity-40 cursor-help"
                        )}
                      >
                        <span className={cn("shrink-0", (isActive && isSelected) ? "text-primary-foreground" : isActive ? cfg.color : "text-muted-foreground/40")}>
                          {cfg.icon}
                        </span>
                        <span className="truncate">{cfg.name}</span>
                        {!isActive && <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 bg-background border border-border px-1 rounded text-[6px] font-black uppercase text-muted-foreground">Offline</div>}
                      </button>
                    </div>
                  );
                })}
              </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 w-full shrink-0">
        <Button
          onClick={onAbort}
          variant="outline"
          className="h-14 flex-1 text-[10px] font-black uppercase tracking-[0.3em] border-2 border-border/60 hover:bg-muted/40 rounded-2xl cursor-pointer"
        >
          <X size={16} className="mr-2" /> CANCEL
        </Button>

        <div className="flex-[2] relative group/btn">
            <Button
              onClick={onExecute}
              disabled={!targetRole.trim() || selectedPlatforms.length === 0}
              className="h-14 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_40px_rgba(var(--primary-rgb),0.4)] relative z-10 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
            >
              START SEARCH <ChevronRight size={18} className="ml-2" />
            </Button>
          {/* Button Tubelight Effect */}
          <div className="absolute inset-x-6 bottom-[1px] h-[2px] bg-white/60 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-[2px] z-20 pointer-events-none" />
        </div>
      </div>

      {/* System Readout */}
      <div className="flex items-center justify-center gap-8 w-full pt-4 shrink-0 border-t border-border/20">
        <div className="text-center flex flex-col items-center">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Technology</p>
          <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40 text-[9px] font-black text-foreground">AI Intelligence</div>
        </div>
        <div className="h-6 w-[1px] bg-border/40" />
        <div className="text-center flex flex-col items-center">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Scanning</p>
          <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40 text-[9px] font-black text-foreground uppercase">Local Browser</div>
        </div>
        <div className="h-6 w-[1px] bg-border/40" />
        <div className="text-center flex flex-col items-center">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Region</p>
          <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40 text-[9px] font-black text-primary uppercase">{location || "WORLDWIDE"}</div>
        </div>
      </div>
    </motion.div>
  );
}