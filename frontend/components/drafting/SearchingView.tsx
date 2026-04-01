"use client";

import React, { useEffect, useRef } from "react";
import { Search, Terminal, CheckCircle2, XCircle, Loader2, ChevronRight, Archive } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type Thought = { text: string; type: "thinking" | "match" | "skip" | "error" | "done" };
export type JobMatch = { id: number; title: string; company: string; location: string; url: string; score: number; reason: string };

interface SearchingViewProps {
  thoughts: Thought[];
  jobs: JobMatch[];
  isDone: boolean;
  targetRole: string;
  platform: string;
  onStop: () => void;
}

export function SearchingView({ thoughts, jobs, isDone, targetRole, platform, onStop }: SearchingViewProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [thoughts]);

  return (
    <motion.div
      key="mission-searching"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full w-full flex flex-col md:flex-row gap-6 max-w-6xl mx-auto py-4 overflow-hidden"
    >
      {/* LEFT: Status + Job Matches */}
      <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {/* Status Card */}
        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 border border-primary/20 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-t-2 border-primary/60 rounded-full"
                  animate={isDone ? {} : { rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isDone
                    ? <CheckCircle2 size={18} className="text-green-500" />
                    : <Search size={16} className="text-primary" />
                  }
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{isDone ? "COMPLETE" : "SCOUTING"}</p>
                <p className="text-[10px] text-muted-foreground">{platform.toUpperCase()} · {targetRole}</p>
              </div>
            </div>
            {!isDone && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onStop}
                className="h-8 w-8 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                <XCircle size={14} />
              </Button>
            )}
          </div>

          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <p className="text-2xl font-black text-primary">{jobs.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Saved</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-black">{thoughts.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Analyzed</p>
            </div>
          </div>

          <AnimatePresence>
            {isDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <Button 
                  asChild
                  className="w-full h-10 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 font-black tracking-tighter"
                >
                  <a href="/vault" className="flex items-center justify-center gap-2">
                    <Archive size={14} />
                    GOTO VAULT
                  </a>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Job Matches */}
        {jobs.length > 0 && (
          <div className="space-y-2 overflow-y-auto no-scrollbar pb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Saved to Vault</p>
            {jobs.map((job, i) => (
              <a
                key={i}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{job.title}</p>
                    <p className="text-[10px] text-muted-foreground">{job.company}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5 line-clamp-2 italic">{job.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className={cn(
                      "text-[9px] font-black px-1.5 py-0",
                      job.score >= 80 ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      job.score >= 60 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      "bg-muted text-muted-foreground border-border"
                    )}>
                      {job.score}%
                    </Badge>
                    <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: AI Terminal */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 rounded-t-2xl border border-b-0 border-border bg-muted/40 flex items-center gap-3 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <Terminal size={12} className="text-primary" />
          <p className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            AI DECISION STREAM
          </p>
          {!isDone && <Loader2 size={12} className="text-primary animate-spin ml-auto" />}
          {isDone && <CheckCircle2 size={12} className="text-green-500 ml-auto" />}
          {!isDone && (
            <Badge variant="outline" className="text-[8px] border-primary/20 text-primary animate-pulse ml-1">LIVE</Badge>
          )}
        </div>

        <div
          ref={logRef}
          className="flex-1 overflow-y-auto p-4 rounded-b-2xl border border-border bg-black/70 font-mono text-[11px] space-y-1.5 no-scrollbar"
        >
          {thoughts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground/30">
              <p className="uppercase tracking-widest text-[10px]">Connecting to local Chrome...</p>
            </div>
          ) : (
            thoughts.map((t, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "leading-relaxed",
                  t.type === "match" ? "text-green-400" :
                  t.type === "skip"  ? "text-yellow-600/70" :
                  t.type === "error" ? "text-red-400" :
                  t.type === "done"  ? "text-primary font-bold" :
                  "text-muted-foreground"
                )}
              >
                <span className="text-muted-foreground/25 mr-2 select-none">{String(i+1).padStart(3,"0")}</span>
                {t.text}
              </motion.p>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
