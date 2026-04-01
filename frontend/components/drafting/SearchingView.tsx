"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Terminal, CheckCircle2, Loader2, Info, ExternalLink, Activity, Sparkles, ChevronDown, Cpu, XCircle, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type Thought = { text: string; type: "thinking" | "match" | "skip" | "error" | "done" };
export type JobMatch = { id: number; title: string; company: string; location: string; url: string; score: number; reason: string };

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

export function SearchingView({ thoughts, jobs, rejected, isDone, targetRole, platform, onStop, onFinish, onAbortStateChange }: SearchingViewProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [abortStep, setAbortStep] = useState<"none" | "confirm" | "final">("none");

  // Call parent whenever abort modal state changes
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

  const allDecisions = [
    ...jobs.map(j => ({ ...j, status: 'saved' as const })),
    ...rejected.map(j => ({ ...j, status: 'rejected' as const }))
  ];

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
      className="h-full w-full flex flex-col gap-6 max-w-7xl mx-auto py-2 overflow-hidden relative"
    >
      {/* Abort Confirmation Modal Overlay */}
      <AnimatePresence>
        {abortStep !== "none" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-card/60 border-2 border-primary/20 rounded-[32px] p-8 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] overflow-hidden relative"
            >
              {/* Scanline for Modal */}
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/40 blur-[2px] animate-pulse" />

              {abortStep === "confirm" ? (
                <div className="space-y-8 text-center relative z-10">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                     <XCircle size={32} className="text-red-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Deactivate Neural Scout?</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono opacity-60">This will terminate the active bridge connection.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleAbortConfirm}
                      className="h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-red-500/20"
                    >
                      Confirm Termination
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setAbortStep("none")}
                      className="h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-muted-foreground hover:text-foreground"
                    >
                      Resume Scouting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 text-center relative z-10">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                     <Activity size={32} className="text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Mission Terminated</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono opacity-60">Final discovery cache secured.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/vault" passHref className="w-full">
                      <Button 
                        onClick={onFinish}
                        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                      >
                        View Discovery Vault
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={onFinish}
                      className="h-14 rounded-2xl border-primary/20 text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5"
                    >
                      Return to Control Hub
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Ambient Background Glow */}
      {!isDone && (
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/15 blur-[120px] pointer-events-none z-0 rounded-[100%] animate-pulse duration-1000" />
      )}

      {/* HEADER: MISSION STATUS BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-primary/20 bg-background/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] shrink-0 overflow-hidden group">

        {/* Sweeping Header Laser */}
        {!isDone && (
          <motion.div
            initial={{ left: "-50%" }}
            animate={{ left: "150%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-[200px] bg-gradient-to-r from-transparent via-primary/20 to-transparent skew-x-12 pointer-events-none z-0"
          />
        )}

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative h-14 w-14 flex items-center justify-center bg-card/50 rounded-2xl border border-border/50 shadow-inner">
            <motion.div
              className="absolute inset-1 border-2 border-primary/40 rounded-xl border-t-primary"
              animate={isDone ? {} : { rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border border-primary/20 rounded-lg border-b-primary"
              animate={isDone ? {} : { rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            {isDone ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Activity className="text-primary animate-pulse drop-shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3 text-foreground drop-shadow-sm">
              {isDone ? "Extraction Complete" : "Neural Job Scouting"}
              {!isDone && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] animate-pulse text-[9px] px-2 py-0">
                  LIVE
                </Badge>
              )}
            </h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none mt-1.5">
              {platform} · {targetRole} · DEPTH: {maxPages} PAGES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10 px-8 border-l border-border/50 hidden lg:flex relative z-10">
          <div className="text-center group/stat">
            <p className="text-2xl font-black text-emerald-500 leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-transform group-hover/stat:scale-110">{jobs.length}</p>
            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-1.5">SAVED</p>
          </div>
          <div className="text-center group/stat">
            <p className="text-2xl font-black text-red-500/80 leading-none transition-transform group-hover/stat:scale-110">{rejected.length}</p>
            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-1.5">DISCARDED</p>
          </div>
          <div className="text-center group/stat">
            <p className="text-2xl font-black text-foreground leading-none transition-transform group-hover/stat:scale-110">{thoughts.length}</p>
            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-1.5">ANALYZED</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setShowDebug(!showDebug)}
            className={cn(
              "rounded-xl text-[10px] font-black uppercase tracking-widest h-12 px-4 transition-all duration-300",
              showDebug ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40 hover:bg-muted/30"
            )}
          >
            <Terminal size={14} className="mr-2" />
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>

          {!isDone ? (
            <Button 
              variant="outline" 
              onClick={() => setAbortStep("confirm")}
              className="rounded-xl border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] text-[10px] tracking-widest font-black uppercase h-12 px-6 transition-all duration-300"
            >
              Abort Mission
            </Button>
          ) : (
            <Link href="/vault" passHref>
              <Button 
                onClick={onFinish}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] text-[10px] tracking-widest font-black uppercase h-12 px-8 transition-all duration-300"
              >
                View Vault
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative z-10">

        {/* LEFT: DISCOVERY HUB */}
        <motion.div layout className="flex-1 flex flex-col min-h-0 bg-background/40 backdrop-blur-2xl rounded-3xl border border-border/50 overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-border/50 flex items-center shrink-0 bg-card/50 relative overflow-hidden">
            <div className="flex items-center gap-2 relative z-10">
              <Sparkles size={14} className={cn("transition-colors duration-700", !isDone ? "text-primary animate-pulse" : "text-muted-foreground")} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Decision Clusters</span>
            </div>

            {/* Smooth Scanning Laser Line */}
            {!isDone && (
              <motion.div
                initial={{ left: "-150px" }}
                animate={{ left: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-1px] w-[150px] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_-2px_15px_rgba(var(--primary-rgb),1)] z-20"
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-24 relative">
            <AnimatePresence mode="popLayout">
              {allDecisions.length === 0 ? (

                /* THE NEW "NEURAL CORE" EMPTY STATE */
                <motion.div
                  key="empty-core"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8"
                >
                  <div className="relative flex items-center justify-center w-40 h-40">
                    {/* Outer 3D Ring */}
                    <motion.div
                      animate={{ rotateX: 360, rotateY: 180 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-primary/30 border-l-primary/60"
                    />
                    {/* Inner 3D Ring */}
                    <motion.div
                      animate={{ rotateY: 360, rotateZ: -180 }}
                      transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                      className="absolute inset-4 rounded-full border border-primary/40 border-r-primary border-dashed"
                    />
                    {/* Pulsing Core */}
                    <div className="absolute inset-10 rounded-full bg-primary/10 blur-md animate-pulse" />
                    <Cpu size={36} className="text-primary relative z-10 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),1)]" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground drop-shadow-md">Engaging Neural Scout...</p>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-primary/60">Intercepting High-Grade Targets</p>
                  </div>
                </motion.div>

              ) : (
                allDecisions.slice().reverse().map((job, idx) => (
                  <motion.div
                    key={`${job.status}-${job.url}-${idx}`}
                    layout="position"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    className={cn(
                      "group relative rounded-2xl border-2 transition-all duration-500 overflow-hidden backdrop-blur-md",
                      expandedId === `${job.status}-${idx}`
                        ? "bg-card/80 border-primary/40 shadow-[0_10px_40px_rgba(var(--primary-rgb),0.15)]"
                        : "bg-card/30 border-border/40 hover:border-border hover:bg-card/60",
                      job.status === 'rejected' && expandedId !== `${job.status}-${idx}` && "opacity-60 hover:opacity-100 grayscale-[0.5]"
                    )}
                  >
                    <div
                      onClick={() => setExpandedId(expandedId === `${job.status}-${idx}` ? null : `${job.status}-${idx}`)}
                      className="p-5 flex items-center justify-between cursor-pointer relative z-10"
                    >
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border-2 shadow-inner transition-colors duration-300",
                          job.status === 'saved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {job.score}%
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <h4 className="text-[13px] font-black uppercase tracking-widest truncate flex items-center gap-3 transition-colors duration-300 group-hover:text-foreground">
                            {job.title}
                            <Badge className={cn("text-[8px] px-2 py-0.5 border-none font-black tracking-widest uppercase",
                              job.status === 'saved' ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
                            )}>
                              {job.status}
                            </Badge>
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{job.company} <span className="text-border/80 mx-1">|</span> {job.location}</p>
                        </div>
                      </div>

                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 border",
                        expandedId === `${job.status}-${idx}` ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/50 text-muted-foreground border-transparent group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
                      )}>
                        <ChevronDown size={14} className={cn("transition-transform duration-500", expandedId === `${job.status}-${idx}` && "rotate-180")} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === `${job.status}-${idx}` && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="px-5 pb-5 overflow-hidden relative z-10"
                        >
                          <div className="pt-4 border-t border-border/40 space-y-5">
                            <div className="flex items-start gap-4 p-5 rounded-xl bg-background/50 border border-border/50 shadow-inner">
                              <Info size={16} className={cn("mt-0.5 shrink-0", job.status === 'saved' ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : "text-red-500")} />
                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">AI Neural Evaluation</p>
                                <p className="text-xs leading-relaxed font-medium text-foreground/90">{job.reason}</p>
                              </div>
                            </div>
                            {job.status === 'saved' && (
                              <div className="flex justify-end">
                                <Button asChild size="sm" variant="outline" className="h-10 px-6 rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em] gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]">
                                  <a href={job.url} target="_blank" rel="noopener noreferrer">SECURE NODE <ExternalLink size={12} /></a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tubelight Rim effect for active card */}
                    {expandedId === `${job.status}-${idx}` && (
                      <motion.div
                        layoutId="active-job-rim-light"
                        className={cn(
                          "absolute inset-x-8 bottom-0 h-[2px] blur-[1px] z-20 rounded-full",
                          job.status === 'saved' ? "bg-primary shadow-[0_-2px_20px_rgba(var(--primary-rgb),1)]" : "bg-red-500 shadow-[0_-2px_20px_rgba(239,68,68,1)]"
                        )}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT: MISSION LOG (Holographic Terminal) */}
        <AnimatePresence>
          {showDebug && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 flex flex-col min-h-0 bg-[#050505] rounded-3xl border border-border/30 overflow-hidden font-mono text-[10px] shadow-2xl relative"
            >
              {/* CRT Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.03)_50%,rgba(255,255,255,0))] bg-[length:100%_4px] opacity-40 z-10" />

              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 shrink-0 relative z-20">
                <Terminal size={14} className="text-primary" />
                <span className="font-bold uppercase tracking-[0.2em] text-[9px] text-muted-foreground">Activity Monitor</span>
                {!isDone && <Loader2 size={12} className="animate-spin text-primary ml-auto" />}
              </div>

              <div ref={logRef} className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar relative z-20 opacity-90">
                {thoughts.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "break-words py-0.5 leading-relaxed tracking-tight",
                      t.type === "match" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" :
                        t.type === "skip" ? "text-orange-400/80" :
                          t.type === "error" ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]" :
                            "text-zinc-500"
                    )}>
                    <span className="text-zinc-700 mr-3">[{String(i + 1).padStart(3, "0")}]</span>
                    {t.text}
                  </motion.div>
                ))}
                {!isDone && (
                  <div className="flex items-center gap-2 text-primary py-2">
                    <span className="w-2 h-3 bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" />
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