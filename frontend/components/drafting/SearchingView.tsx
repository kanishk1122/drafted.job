"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search, Terminal, CheckCircle2, Loader2, Info, ExternalLink, Activity, Sparkles, ChevronDown, Cpu, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type Thought = { text: string; type: "thinking" | "match" | "skip" | "error" | "done" };
export type JobMatch = { id: number; title: string; company: string; location: string; url: string; score: number; reason: string };
export type JobDecision = JobMatch & { status: 'saved' | 'rejected' };

interface SearchingViewProps {
  thoughts: Thought[];
  jobs: JobMatch[];
  rejected: JobMatch[];
  isDone: boolean;
  targetRole: string;
  platform: string;
  onStop: () => void;
  onFinish: () => void;
  onAbortStateChange?: (active: boolean) => void;
}

const smoothEasing = [0.16, 1, 0.3, 1] as const;

// ==========================================
// OPTIMIZATION 1: MEMOIZED JOB CARD
// This ensures a card ONLY re-renders if it is explicitly clicked.
// It ignores all global state changes (like incoming logs).
// ==========================================
interface JobCardItemProps {
  job: JobDecision;
  cardId: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const areCardsEqual = (prev: JobCardItemProps, next: JobCardItemProps) => {
  return prev.isExpanded === next.isExpanded && prev.job.id === next.job.id && prev.job.status === next.job.status;
};

const JobCardItem = React.memo(({ job, cardId, isExpanded, onToggle }: JobCardItemProps) => {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 400, mass: 0.8 }}
      className={cn(
        "group relative rounded-2xl border transition-all duration-300 overflow-hidden bg-card/40 backdrop-blur-sm transform-gpu will-change-transform",
        isExpanded
          ? "bg-card/80 border-primary/30 shadow-lg"
          : "border-border/40 hover:border-border/80 hover:bg-card/60",
        job.status === 'rejected' && !isExpanded && "opacity-60 hover:opacity-100"
      )}
    >
      <div
        onClick={() => onToggle(cardId)}
        className="p-5 flex items-center justify-between cursor-pointer relative z-10"
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border",
            job.status === 'saved'
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            {job.score}%
          </div>
          <div className="min-w-0 space-y-1.5">
            <h4 className="text-[13px] font-black uppercase tracking-widest truncate flex items-center gap-3 text-foreground/90 group-hover:text-foreground">
              {job.title}
              <Badge className={cn("text-[8px] px-2 py-[2px] border-none font-black tracking-widest uppercase",
                job.status === 'saved' ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
              )}>
                {job.status}
              </Badge>
            </h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] truncate">{job.company} <span className="text-border mx-2">|</span> {job.location}</p>
          </div>
        </div>

        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center transition-all border",
          isExpanded
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-muted/50 text-muted-foreground border-transparent group-hover:bg-muted group-hover:text-foreground"
        )}>
          <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-5 overflow-hidden relative z-10"
          >
            <div className="pt-4 border-t border-border/50 space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <Info size={16} className={cn("mt-0.5 shrink-0", job.status === 'saved' ? "text-primary" : "text-red-500")} />
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">AI Evaluation</p>
                  <p className="text-xs leading-relaxed font-medium text-foreground/80">{job.reason}</p>
                </div>
              </div>
              {job.status === 'saved' && (
                <div className="flex justify-end">
                  <Button asChild size="sm" variant="outline" className="h-10 px-6 rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em] gap-2 transition-all">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">SECURE NODE <ExternalLink size={12} /></a>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isExpanded && (
        <div className={cn(
          "absolute inset-x-8 bottom-0 h-[2px] z-20 rounded-t-full",
          job.status === 'saved' ? "bg-primary shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.5)]" : "bg-red-500 shadow-[0_-2px_10px_rgba(239,68,68,0.5)]"
        )} />
      )}
    </motion.div>
  );
}, areCardsEqual);
JobCardItem.displayName = "JobCardItem";


// ==========================================
// MAIN COMPONENT
// ==========================================
export function SearchingView({ thoughts, jobs, rejected, isDone, targetRole, platform, onStop, onFinish, onAbortStateChange }: SearchingViewProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [abortStep, setAbortStep] = useState<"none" | "confirm" | "final">("none");

  useEffect(() => {
    onAbortStateChange?.(abortStep !== "none");
  }, [abortStep, onAbortStateChange]);

  useEffect(() => {
    if (logRef.current && showDebug) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [thoughts, showDebug]);

  const pageThought = thoughts.find(t => t.text.includes("Mission Scope:"));
  const maxPages = pageThought ? pageThought.text.match(/(\d+) pages/)?.[1] : "??";

  // OPTIMIZATION 2: useMemo prevents the array from being recreated on every render
  const allDecisions = useMemo<JobDecision[]>(() => [
    ...jobs.map(j => ({ ...j, status: 'saved' as const })),
    ...rejected.map(j => ({ ...j, status: 'rejected' as const }))
  ], [jobs, rejected]);

  // OPTIMIZATION 3: useCallback prevents the toggle function from failing the React.memo equality check
  const handleToggleCard = useCallback((cardId: string) => {
    setExpandedId(prev => prev === cardId ? null : cardId);
  }, []);

  const handleAbortConfirm = () => {
    onStop();
    setAbortStep("final");
    localStorage.removeItem("active_mission_state");
  };

  return (
    <motion.div
      key="mission-searching"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: smoothEasing }}
      className="h-full w-full flex flex-col gap-6 max-w-7xl mx-auto py-2 overflow-hidden relative"
    >
      {/* Abort Confirmation Modal Overlay */}
      <AnimatePresence>
        {abortStep !== "none" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-2 border-primary/20 rounded-[32px] p-8 shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] overflow-hidden relative"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />

              {abortStep === "confirm" ? (
                <div className="space-y-8 text-center relative z-10">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                     <XCircle size={32} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Deactivate Neural Scout?</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono opacity-80">This will terminate the active bridge connection.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleAbortConfirm}
                      className="h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest transition-all duration-300"
                    >
                      Confirm Termination
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setAbortStep("none")}
                      className="h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-300"
                    >
                      Resume Scouting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 text-center relative z-10">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                     <Activity size={32} className="text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Mission Terminated</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono opacity-80">Final discovery cache secured.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/vault" passHref className="w-full">
                      <Button 
                        onClick={onFinish}
                        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest transition-all duration-300"
                      >
                        View Discovery Vault
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isDone && (
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] pointer-events-none z-0 rounded-full" />
      )}

      {/* HEADER: MISSION STATUS BAR */}
      <motion.div 
        layout="position"
        className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-lg shrink-0 overflow-hidden"
      >
        {!isDone && (
          <motion.div
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 left-0 w-[200px] bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-12 pointer-events-none z-0 transform-gpu"
          />
        )}

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative h-14 w-14 flex items-center justify-center bg-card/50 rounded-2xl border border-border/50 shadow-inner">
            <motion.div
              className="absolute inset-1 border-[1.5px] border-primary/20 rounded-xl border-t-primary/80 transform-gpu"
              animate={isDone ? { rotate: 0 } : { rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[6px] border border-primary/10 rounded-lg border-b-primary/60 transform-gpu"
              animate={isDone ? { rotate: 0 } : { rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <AnimatePresence mode="wait">
              {isDone ? (
                <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </motion.div>
              ) : (
                <motion.div key="active" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Activity className="text-primary" size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3 text-foreground">
              {isDone ? "Extraction Complete" : "Neural Job Scouting"}
              {!isDone && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse text-[9px] px-2 py-0">
                  LIVE
                </Badge>
              )}
            </h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none mt-1.5">
              {platform} <span className="opacity-50">·</span> {targetRole} <span className="opacity-50">·</span> DEPTH: {maxPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10 px-8 border-l border-border/50 hidden lg:flex relative z-10">
          {[
            { label: "SAVED", count: jobs.length, color: "text-emerald-500" },
            { label: "DISCARDED", count: rejected.length, color: "text-red-500/80" },
            { label: "ANALYZED", count: thoughts.length, color: "text-foreground" }
          ].map((stat) => (
            <div key={stat.label} className="text-center group/stat cursor-default">
              <motion.p 
                key={stat.count}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn("text-2xl font-black leading-none transition-all duration-300", stat.color)}
              >
                {stat.count}
              </motion.p>
              <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setShowDebug(!showDebug)}
            className={cn(
              "rounded-xl text-[10px] font-black uppercase tracking-widest h-12 px-5 transition-all",
              showDebug ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 hover:bg-muted/50"
            )}
          >
            <Terminal size={14} className="mr-2" />
            {showDebug ? "Hide Log" : "Show Log"}
          </Button>

          {!isDone ? (
            <Button 
              variant="outline" 
              onClick={() => setAbortStep("confirm")}
              className="rounded-xl border-red-500/20 text-red-500/90 hover:bg-red-500 hover:text-white text-[10px] tracking-widest font-black uppercase h-12 px-6 transition-all"
            >
              Abort Mission
            </Button>
          ) : (
            <Link href="/vault" passHref>
              <Button className="rounded-xl bg-primary text-primary-foreground text-[10px] tracking-widest font-black uppercase h-12 px-8 transition-all hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                View Vault
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative z-10">

        {/* LEFT: DISCOVERY HUB */}
        <div className="flex-1 flex flex-col min-h-0 bg-background/50 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-xl relative">
          <div className="p-4 border-b border-border/50 flex items-center shrink-0 bg-card/40 relative overflow-hidden">
            <div className="flex items-center gap-2 relative z-10">
              <Sparkles size={14} className={cn("transition-colors duration-700", !isDone ? "text-primary animate-pulse" : "text-muted-foreground")} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90">Decision Clusters</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar pb-24 relative">
            <AnimatePresence mode="popLayout">
              {allDecisions.length === 0 ? (
                <motion.div
                  key="empty-core"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8"
                >
                  <div className="relative flex items-center justify-center w-32 h-32">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-[1px] border-primary/20 border-l-primary/60 transform-gpu"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      className="absolute inset-4 rounded-full border-[1px] border-primary/30 border-r-primary/80 border-dashed transform-gpu"
                    />
                    <div className="absolute inset-10 rounded-full bg-primary/10 animate-pulse" />
                    <Cpu size={32} className="text-primary relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-foreground">Engaging Neural Scout...</p>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-primary/60">Awaiting Target Acquisition</p>
                  </div>
                </motion.div>
              ) : (
                /* OPTIMIZATION 4: Mapping the isolated, memoized JobCardItem */
                allDecisions.slice().reverse().map((job, idx) => {
                  const cardId = `${job.status}-${job.id || idx}`;
                  return (
                    <JobCardItem 
                      key={cardId}
                      job={job}
                      cardId={cardId}
                      isExpanded={expandedId === cardId}
                      onToggle={handleToggleCard}
                    />
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: MISSION LOG */}
        <AnimatePresence>
          {showDebug && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: smoothEasing }}
              className="shrink-0 flex flex-col min-h-0 bg-[#0a0a0a] rounded-3xl border border-border/50 overflow-hidden font-mono text-[10px] shadow-xl relative transform-gpu"
            >
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0))] bg-[length:100%_4px] opacity-40 z-10" />

              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 shrink-0 relative z-20">
                <Terminal size={14} className="text-primary" />
                <span className="font-bold uppercase tracking-[0.2em] text-[9px] text-muted-foreground">Activity Monitor</span>
                {!isDone && <Loader2 size={12} className="animate-spin text-primary ml-auto" />}
              </div>

              <div ref={logRef} className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar relative z-20">
                <AnimatePresence initial={false}>
                  {thoughts.slice(-50).map((t, i) => (
                    <motion.div
                      key={`${i}-${t.text.substring(0, 10)}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "break-words py-0.5 leading-relaxed tracking-tight transform-gpu",
                        t.type === "match" ? "text-emerald-400" :
                          t.type === "skip" ? "text-orange-400/80" :
                            t.type === "error" ? "text-red-400" :
                              "text-zinc-400"
                      )}>
                      <span className="text-zinc-600 mr-3 opacity-70">[{String(thoughts.length - 50 + i > 0 ? thoughts.length - 50 + i : i + 1).padStart(3, "0")}]</span>
                      {t.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!isDone && (
                  <div className="flex items-center gap-2 py-2">
                    <span className="w-2.5 h-3.5 bg-primary/80 animate-pulse" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}