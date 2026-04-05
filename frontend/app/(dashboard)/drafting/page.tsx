"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Play, Layers, RefreshCcw, ArrowRight, Zap, TerminalSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch, RootState } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { toast } from "sonner";
import { fetchBrowserSessions, deleteBrowserSession } from "@/lib/redux/slices/browserSlice";

import { PlatformList } from "@/components/drafting/PlatformList";
import { SearchHistory, SearchSession } from "@/components/drafting/SearchHistory";
import { ConfigBlock } from "@/components/drafting/MissionConfig";
import { InitiationView } from "@/components/drafting/InitiationView";

const LS_KEY = "active_mission_state";

export default function DraftingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth);
  const context = useAppSelector((state: RootState) => state.profile.context);

  const [view, setView] = useState<"operational" | "initiate">("operational");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('initiate') === 'true') {
      setView("initiate");
    }
  }, []);

  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("India");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const { sessions, loading: sessionsLoading, hasMore } = useAppSelector((state: RootState) => state.browser);
  const [activeMission, setActiveMission] = useState<any>(null);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const PLATFORM_IDS = ["linkedin", "naukri", "indeed", "foundit", "glassdoor", "ambitionbox", "instahyre"];
  const activePlatforms: string[] = context
    ? PLATFORM_IDS.filter(p => {
      const key = `${p}_active` as keyof typeof context;
      return context[key] === true;
    })
    : [];

  useEffect(() => {
    if (!context) dispatch(fetchProfile({ force: false }));

    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) setActiveMission(parsed);
    }
  }, [dispatch, context]);

  const loadSessions = useCallback(async () => {
    if (user.userEmail) {
      dispatch(fetchBrowserSessions({ userId: user.userEmail as string }));
    }
  }, [dispatch, user.userEmail]);

  const handleLoadMore = () => {
    if (user.userEmail && hasMore && !sessionsLoading) {
      dispatch(fetchBrowserSessions({
        userId: user.userEmail as string,
        skip: sessions.length,
        limit: 20
      }));
    }
  };

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const startSearch = () => {
    if (!user.userEmail) { toast.error("Please log in first."); return; }
    const platformString = selectedPlatforms.join(",");
    const params = new URLSearchParams({
      platform: platformString,
      role: targetRole,
      location,
    });
    router.push(`/drafting/scout?${params.toString()}`);
  };

  const resumeMission = () => {
    router.push(`/drafting/scout?resume=true`);
  };

  const handleRestartSession = (session: SearchSession) => {
    const parts = session.name.split(" · ");
    setTargetRole(parts[0] || "");
    const p = parts[1]?.toLowerCase() || "linkedin";
    setSelectedPlatforms(p.includes(",") ? p.split(",") : [p]);
    setView("initiate");
  };

  return (
    <div className="relative h-full w-full bg-background overflow-hidden selection:bg-primary/20">
      <AnimatePresence mode="wait">

        {/* ────── ACTIVE SEARCH OVERLAY (FLUID WIDTH) ────── */}
        {activeMission && view === "operational" && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute left-1/2 top-4 md:top-6 z-50 flex w-[calc(100%-2rem)] md:w-max md:min-w-[500px] items-center justify-between rounded-2xl border border-primary/30 bg-background/80 p-3 md:p-4 shadow-2xl shadow-primary/10 backdrop-blur-2xl"
          >
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <Zap size={18} className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              </div>
              <div className="min-w-0 flex-col">
                <p className="text-[10px] md:text-xs font-black uppercase leading-none tracking-[0.2em] text-primary">Active Mission</p>
                <p className="mt-1 truncate font-mono text-[10px] md:text-xs lowercase text-muted-foreground/80">
                  {activeMission.targetRole} <span className="text-foreground/40">@</span> {activeMission.platform}
                </p>
              </div>
            </div>
            <Button
              onClick={resumeMission}
              className="h-9 md:h-10 shrink-0 gap-2 rounded-xl bg-primary/10 px-4 md:px-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <span className="hidden sm:inline">RESUME</span>
              <ArrowRight size={14} />
            </Button>
          </motion.div>
        )}

        {/* ── MAIN VIEW ── */}
        {view === "operational" && (
          <motion.div
            key="operational-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full w-full overflow-y-auto no-scrollbar"
          >
            {/* FLUID CONTAINER: 
              Padding uses clamp() to smoothly transition between small and large windows.
              Max-width caps out at 1800px for ultra-wides.
            */}
            <div className="mx-auto w-full max-w-[1800px] p-4 pt-20 md:pt-16">

              {/* HEADER SECTION */}
              <div className="mb-6 xl:mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-border/40 pb-4 md:pb-6">
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TerminalSquare size={18} />
                    </div>
                    <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-none tracking-tighter text-foreground">
                      Job Search
                    </h1>
                  </div>
                  <p className="pl-11 text-[clamp(9px,1vw,12px)] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                    Find & Track Opportunities
                  </p>
                </div>

                <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 md:gap-3">
                  <Button
                    variant="outline"
                    onClick={loadSessions}
                    disabled={sessionsLoading}
                    className="h-10 flex-1 sm:flex-none rounded-xl border-border/40 bg-background/50 px-4 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md transition-all hover:bg-muted/80 hover:border-border"
                  >
                    <RefreshCcw size={14} className={`mr-2.5 ${sessionsLoading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">REFRESH</span>
                  </Button>
                  <Button
                    onClick={() => setView("initiate")}
                    className="group h-10 flex-1 sm:flex-none rounded-xl bg-primary px-6 text-[10px] sm:text-[11px] font-black uppercase leading-none tracking-[0.15em] text-primary-foreground shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_-5px_rgba(var(--primary),0.6)]"
                  >
                    START NEW SEARCH
                    <Play size={14} className="ml-2.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              {/* FLUID GRID LAYOUT:
                1 column on narrow windows (<768px)
                12 columns on anything wider.
                Adjusts proportion based on available real estate.
              */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 xl:gap-8">

                {/* LEFT COLUMN: Platforms */}
                <div className="md:col-span-5 lg:col-span-4 xl:col-span-3 2xl:col-span-3">
                  <Card className="sticky top-6 h-fit overflow-hidden border-border/40 shadow-2xl shadow-black/5 bg-card/60 backdrop-blur-2xl transition-all">
                    <CardHeader className="border-b border-border/20 bg-muted/20 px-5 py-4 lg:px-6 lg:py-5">
                      <CardTitle className="flex items-center gap-3 text-[11px] lg:text-[12px] font-black uppercase tracking-[0.2em] text-foreground/80">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                          <Layers size={14} className="text-primary" />
                        </div>
                        Supported Platforms
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PlatformList />
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT COLUMN: History & Data */}
                <div className="flex flex-col space-y-6 lg:space-y-8 xl:space-y-10 md:col-span-7 lg:col-span-8 xl:col-span-9 2xl:col-span-9">

                  {/* MAIN DATA VIEW */}
                  <div className="w-full">
                    <SearchHistory
                      sessions={sessions}
                      loading={sessionsLoading}
                      hasMore={hasMore}
                      onLoadMore={handleLoadMore}
                      onDelete={(id) => {
                        if (user.userEmail) {
                          dispatch(deleteBrowserSession({ sessionId: id, userId: user.userEmail as string }));
                        }
                      }}
                      onClearAll={() => { }}
                      onRestart={handleRestartSession}
                    />
                  </div>

                  {/* STATS & METRICS ROW */}
                  <div className="grid grid-cols-1 gap-6 xl:gap-8 sm:grid-cols-2">

                    {/* Settings Config */}
                    <Card className="flex flex-col justify-center space-y-5 border-border/40 shadow-xl shadow-black/5 bg-gradient-to-br from-card/60 to-card/20 p-6 lg:p-8 backdrop-blur-2xl">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80">Active Parameters</p>
                      </div>
                      <div className="space-y-3.5">
                        <ConfigBlock label="Search Mode" value="INTELLIGENT SCORING" />
                        <ConfigBlock label="Data Extraction" value="AUTOMATED SCANNING" />
                        <ConfigBlock label="Analysis" value="LLAMA 3.1" />
                      </div>
                    </Card>

                    {/* Global Overview */}
                    <Card className="group flex flex-col justify-center border-border/40 shadow-xl shadow-black/5 bg-gradient-to-bl from-card/60 to-card/20 p-6 lg:p-8 backdrop-blur-2xl relative overflow-hidden">
                      {/* Decorative background glow */}
                      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-[50px] transition-all group-hover:bg-emerald-500/10" />

                      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80">Search Overview</p>
                      <div className="flex flex-wrap items-end gap-4 lg:gap-6">
                        {/* Fluid massive numbers */}
                        <span className="leading-none text-foreground tabular-nums text-[clamp(3.5rem,6vw,5.5rem)] font-black tracking-tighter drop-shadow-sm">
                          {sessions.length}
                        </span>
                        <div className="flex flex-col pb-1.5 lg:pb-3">
                          <span className="flex items-center gap-1.5 text-[11px] lg:text-xs font-black uppercase tracking-widest text-emerald-500">
                            <CheckCircleIcon size={12} className="shrink-0" />
                            {sessions.filter(s => s.status === "completed").length} SUCCESSFUL
                          </span>
                          <span className="mt-1 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Total Missions Logged
                          </span>
                        </div>
                      </div>
                    </Card>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ────── NEW SEARCH FORM VIEW ────── */}
        {view === "initiate" && (
          <InitiationView
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            location={location}
            setLocation={setLocation}
            selectedPlatforms={selectedPlatforms}
            togglePlatform={togglePlatform}
            activePlatforms={activePlatforms}
            onAbort={() => setView("operational")}
            onExecute={startSearch}
          />
        )}

      </AnimatePresence>
    </div>
  );
}

// Quick helper icon for the stats panel
function CheckCircleIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}