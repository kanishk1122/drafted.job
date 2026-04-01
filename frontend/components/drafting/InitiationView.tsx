"use client";
import React from "react";
import { Search, ArrowRight, X, Globe, Link2, MapPin, Target, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Full registry of supported platforms
const PLATFORM_REGISTRY: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  linkedin:    { name: "LinkedIn",   icon: <Link2 className="w-4 h-4" />, color: "text-[#0A66C2]" },
  naukri:      { name: "Naukri",     icon: <Globe className="w-4 h-4" />, color: "text-yellow-500" },
  indeed:      { name: "Indeed",     icon: <Globe className="w-4 h-4" />, color: "text-[#2164f3]" },
  foundit:     { name: "Foundit",    icon: <Globe className="w-4 h-4" />, color: "text-purple-400" },
  glassdoor:   { name: "Glassdoor",  icon: <Globe className="w-4 h-4" />, color: "text-green-400" },
  ambitionbox: { name: "AmbitionBox",icon: <Globe className="w-4 h-4" />, color: "text-blue-400" },
};

interface InitiationViewProps {
  targetRole: string;
  setTargetRole: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  platform: string;
  setPlatform: (v: string) => void;
  activePlatforms: string[];  // from backend — only connected platforms
  onAbort: () => void;
  onExecute: () => void;
}

export function InitiationView({
  targetRole, setTargetRole,
  location, setLocation,
  platform, setPlatform,
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
          Begin Search
        </h2>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] relative z-10">
          AI will control your local Chrome
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
              Operation Zone
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
              Target Network
            </label>
            {activePlatforms.length === 0 ? (
              <Link href="/connect" className="flex items-center gap-2 h-14 px-4 rounded-xl border-2 border-dashed border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/10 transition-all">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                No networks connected — Click to Connect
              </Link>
            ) : (
              <div className={`grid gap-2 h-14 p-1 rounded-xl border-2 border-border/60 bg-background/50`}
                   style={{ gridTemplateColumns: `repeat(${Math.min(activePlatforms.length, 3)}, 1fr)` }}>
                {activePlatforms.map(pid => {
                  const cfg = PLATFORM_REGISTRY[pid];
                  if (!cfg) return null;
                  return (
                    <button
                      key={pid}
                      onClick={() => setPlatform(pid)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300",
                        platform === pid
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span className={platform === pid ? "text-primary-foreground" : cfg.color}>
                        {cfg.icon}
                      </span>
                      {cfg.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 w-full shrink-0">
        <Button
          onClick={onAbort}
          variant="outline"
          className="h-14 flex-1 text-[10px] font-black uppercase tracking-[0.3em] border-2 border-border/60 hover:bg-muted/40 rounded-2xl"
        >
          <X size={16} className="mr-2" /> CANCEL
        </Button>

        <div className="flex-[2] relative group/btn">
          <Button
            onClick={onExecute}
            disabled={!targetRole.trim()}
            className="h-14 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_40px_rgba(var(--primary-rgb),0.4)] relative z-10 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            LAUNCH SCOUT <ChevronRight size={18} className="ml-2" />
          </Button>
          {/* Button Tubelight Effect */}
          <div className="absolute inset-x-6 bottom-[1px] h-[2px] bg-white/60 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-[2px] z-20 pointer-events-none" />
        </div>
      </div>

      {/* HUD Readout */}
      <div className="flex items-center justify-center gap-8 w-full pt-4 shrink-0 border-t border-border/20">
        <div className="text-center flex flex-col items-center">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Engine</p>
          <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40 text-[9px] font-black text-foreground">NVIDIA NIM</div>
        </div>
        <div className="h-6 w-[1px] bg-border/40" />
        <div className="text-center flex flex-col items-center">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Browser</p>
          <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40 text-[9px] font-black text-foreground uppercase">Local Chrome</div>
        </div>
        <div className="h-6 w-[1px] bg-border/40" />
        <div className="text-center flex flex-col items-center">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Zone</p>
          <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40 text-[9px] font-black text-primary uppercase">{location || "GLOBAL"}</div>
        </div>
      </div>
    </motion.div>
  );
}