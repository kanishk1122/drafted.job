"use client";

import React from "react";
import { Search, Terminal, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface SearchingViewProps {
  searchProgress: number;
}

export function SearchingView({ searchProgress }: SearchingViewProps) {
  return (
    <motion.div 
      key="mission-searching"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full w-full flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto py-8 overflow-hidden"
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-8">
          <div className="relative flex items-center justify-center h-48 w-48 mx-auto">
            <div className="absolute inset-0 border border-primary/10 rounded-full" />
            <div className="absolute inset-4 border border-primary/5 rounded-full" />
            <div className="absolute inset-8 border border-primary/5 rounded-full" />
            
            <motion.div 
              className="absolute inset-0 border-t-2 border-primary/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 bg-card/60 backdrop-blur-xl h-20 w-20 rounded-full border-2 border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search size={32} className="text-primary" />
              </motion.div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Search Active</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Scanning 6 Career Ecosystems...</p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4 px-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
            <span className="text-primary">Search Progress</span>
            <span className="text-foreground tabular-nums">{searchProgress}%</span>
          </div>
          <div className="h-2 w-full bg-card border border-border rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div 
              className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${searchProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="w-full md:w-[450px] h-[550px] flex flex-col shrink-0 px-4">
        <Card className="flex-1 bg-black/40 border-border/40 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col border-2 shadow-2xl relative">
          <CardHeader className="p-4 border-b border-border/20 bg-muted/10 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 tracking-[0.2em] uppercase text-primary">
                <Terminal size={14} />
                PROFESSIONAL DECISION STREAM
              </CardTitle>
              <Badge variant="outline" className="text-[8px] border-primary/20 text-primary animate-pulse">LIVE INDEXING</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden relative">
            <ScrollArea className="h-full font-mono">
              <div className="p-6 space-y-3 pb-24">
                <LogItem time="22:45:01" type="SYSTEM" message="Initializing Advanced Search Engine V2.4..." active={searchProgress > 0} />
                <LogItem time="22:45:03" type="LINKEDIN" message="Scanning India Regional Cluster for 'Senior System Architect'..." active={searchProgress > 10} />
                <LogItem time="22:45:08" type="ANALYSIS" message="MATCH: Frontend Lead @ Google. Score: 96% - Alignment: HIGH." active={searchProgress > 25} hilite />
                <LogItem time="22:45:12" type="DECISION" message="INDEXED: Job Data Secured for Automated Cover Letter Prep." active={searchProgress > 30} hilite />
                <LogItem time="22:45:20" type="NAUKRI" message="Scanning Naukri Premium Pool... 42 potential roles detected." active={searchProgress > 45} />
                <LogItem time="22:45:25" type="DECISION" message="DISCARDED: Jr Web Dev (Experience Level Mismatch)." active={searchProgress > 60} />
                <LogItem time="22:45:32" type="ANALYSIS" message="MATCH: AI Engineer @ Zomato. Score: 88% - Role Fit: HIGH." active={searchProgress > 75} />
                <LogItem time="22:45:40" type="INDEED" message="Final Cleanup of Remote Ecosystems... 12 roles verified." active={searchProgress > 85} />
                <LogItem time="22:45:55" type="SYSTEM" message="SEARCH COMPLETE: 12 Position Targets Captured. Archiving Session." active={searchProgress >= 98} hilite />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {searchProgress === 100 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-8 py-4 rounded-full backdrop-blur-md z-50 shadow-2xl shadow-green-500/20"
        >
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Positions Successfully Indexed - Archiving Result</span>
        </motion.div>
      )}
    </motion.div>
  );
}

function LogItem({ time, type, message, active, hilite }: { time: string, type: string, message: string, active: boolean, hilite?: boolean }) {
  if (!active) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-2 rounded border border-transparent transition-all flex items-start gap-4 ${hilite ? 'bg-primary/10 border-primary/20' : 'hover:bg-white/5'}`}
    >
      <span className="text-[8px] text-muted-foreground/60 font-mono mt-0.5">{time}</span>
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded leading-none ${hilite ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
            {type}
          </span>
          <div className={`h-1 w-1 rounded-full ${hilite ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40'}`} />
        </div>
        <p className={`uppercase tracking-tight leading-relaxed ${hilite ? 'text-primary font-bold' : 'text-muted-foreground text-opacity-80'}`}>
          {message}
        </p>
      </div>
    </motion.div>
  );
}
