"use client";

import React from "react";
import { X, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface InitiationViewProps {
  jobDescription: string;
  setJobDescription: (val: string) => void;
  onAbort: () => void;
  onExecute: () => void;
}

export function InitiationView({ jobDescription, setJobDescription, onAbort, onExecute }: InitiationViewProps) {
  return (
    <motion.div 
      key="search-initiation"
      initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto space-y-6 py-4 px-4"
    >
      <div className="text-center space-y-2 shrink-0">
        <div className="flex justify-center mb-1">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
            <Search size={24} className="text-primary" />
          </div>
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Begin Search</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 px-4">Search Parameters Required</p>
      </div>

      <div className="w-full flex-1 relative group flex flex-col min-h-[250px] mb-4">
        <div className="flex items-center justify-between px-2 pb-3 shrink-0">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Job Description & Professional Req.</span>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 tabular-nums">{jobDescription.length} / 5000</span>
        </div>
        <div className="flex-1 relative w-full h-full">
          <div className="absolute -inset-6 rounded-[40px] bg-primary/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-1000 blur-[80px] pointer-events-none z-0" />
          
          <Textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            autoFocus
            maxLength={5000}
            placeholder="Paste the job description or enter position requirements..."
            className="h-full w-full bg-card/60 border-border border-2 text-lg font-medium tracking-tight p-8 rounded-2xl focus-visible:ring-primary/40 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-offset-0 transition-all placeholder:text-muted-foreground/20 text-foreground resize-none leading-relaxed outline-none shadow-xl no-scrollbar overflow-y-auto relative z-10"
          />

          <div className="absolute inset-x-6 top-[2px] h-[1px] bg-white/20 blur-[1px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700 z-20 pointer-events-none" />
          <div className="absolute inset-x-6 bottom-[2px] h-[2px] bg-primary opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500 blur-[1px] shadow-[0_-4px_20px_rgba(var(--primary-rgb),1)] z-20 pointer-events-none rounded-full" />
          <div className="absolute inset-x-12 bottom-[-2px] h-[10px] bg-primary/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-1000 blur-xl z-20 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-6 w-full shrink-0">
        <Button 
          onClick={onAbort}
          variant="outline" 
          className="h-12 flex-1 text-[10px] font-black uppercase tracking-[0.3em] border-border hover:bg-muted/40 rounded-xl"
        >
          <X size={14} className="mr-2" /> CANCEL
        </Button>
        
        <div className="flex-[2] relative group/btn">
          <Button 
            onClick={onExecute}
            disabled={!jobDescription.trim()}
            className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] relative z-10"
          >
            START SEARCH <ArrowRight size={14} className="ml-2" />
          </Button>
          <div className="absolute inset-x-4 bottom-[1px] h-[2px] bg-white/60 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-[2px] z-20 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full pt-4 shrink-0 border-t border-border/20">
        <div className="text-center sm:block hidden">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Engines</p>
          <p className="text-[10px] font-black text-foreground">6x ECOSYSTEMS</p>
        </div>
        <div className="text-center sm:block hidden border-x border-border/40">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Depth</p>
          <p className="text-[10px] font-black text-foreground uppercase">DEEP SEARCH</p>
        </div>
        <div className="text-center sm:block hidden">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Zone</p>
          <p className="text-[10px] font-black text-foreground">INDIA (ALL)</p>
        </div>
      </div>
    </motion.div>
  );
}
