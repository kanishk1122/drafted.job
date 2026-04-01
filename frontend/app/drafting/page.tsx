"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { Play, Layers, RefreshCcw, ArrowRight, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch, RootState } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { toast } from "sonner";
import { browserApiService } from "@/lib/services/browser-api-service";

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
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("India");
  const [platform, setPlatform] = useState("linkedin");
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeMission, setActiveMission] = useState<any>(null);

  // Compute active platforms from individual flags in Redux state
  const PLATFORM_IDS = ["linkedin", "naukri", "indeed", "foundit", "glassdoor", "ambitionbox", "instahyre"];
  const activePlatforms: string[] = context
    ? PLATFORM_IDS.filter(p => {
        const key = `${p}_active` as keyof typeof context;
        return context[key] === true;
      })
    : [];

  useEffect(() => {
    if (!context) dispatch(fetchProfile());
    
    // Check for active/last mission in localStorage
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) setActiveMission(parsed);
    }
  }, [dispatch, context]);

  const loadSessions = useCallback(async () => {
    if (!user.userEmail) return;
    setSessionsLoading(true);
    try {
      const data = await browserApiService.fetchSessions(user.userEmail);
      setSessions(data);
    } catch {} finally { setSessionsLoading(false); }
  }, [user.userEmail]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const startSearch = () => {
    if (!user.userEmail) { toast.error("Please log in first."); return; }
    
    // Redirect to dedicated mission page
    const params = new URLSearchParams({
      platform,
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
    setPlatform(parts[1]?.toLowerCase() || "linkedin");
    setView("initiate");
  };

  return (
    <DashboardLayout>
      <div className="relative h-full overflow-hidden p-2">
        <AnimatePresence mode="wait">

          {/* ────── ACTIVE MISSION OVERLAY (The "Redirect" Logic) ────── */}
          {activeMission && view === "operational" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 inset-x-4 z-50 p-4 rounded-2xl bg-primary/10 border border-primary/30 backdrop-blur-xl flex items-center justify-between shadow-2xl shadow-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
                  <Zap size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary leading-none">Scout Mission Active</p>
                  <p className="text-[10px] text-muted-foreground mt-1 lowercase font-mono">
                    {activeMission.targetRole} @ {activeMission.platform.toUpperCase()}
                  </p>
                </div>
              </div>
              <Button onClick={resumeMission} className="rounded-xl h-10 px-6 font-black tracking-widest text-[9px] uppercase gap-2">
                CONTINUE SCOUT <ArrowRight size={14} />
              </Button>
            </motion.div>
          )}

          {/* ── OPERATIONAL VIEW ── */}
          {view === "operational" && (
            <motion.div
              key="operational-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full overflow-y-auto no-scrollbar pb-12 pt-16 md:pt-4"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground">Drafting Hub</h1>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    Industrial Mission Initiation — AI Platform Scouting
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSessions}
                    disabled={sessionsLoading}
                    className="h-10 px-4 font-black tracking-widest text-[9px] uppercase rounded-sm border-border/60"
                  >
                    <RefreshCcw size={12} className={`mr-2 ${sessionsLoading ? "animate-spin" : ""}`} /> REFRESH
                  </Button>
                  <Button
                    onClick={() => setView("initiate")}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 rounded-sm shadow-xl shadow-primary/20 tracking-widest text-[10px] uppercase h-10 group leading-none"
                  >
                    BEGIN JOB SCAN <Play size={14} className="ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden h-fit">
                    <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-[12px] font-black flex items-center gap-2.5 tracking-[0.2em] uppercase">
                        <Layers size={14} className="text-primary" /> Multi-Platform Ready
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PlatformList />
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <SearchHistory
                    sessions={sessions}
                    onDelete={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
                    onClearAll={() => setSessions([])}
                    onRestart={handleRestartSession}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                    <Card className="bg-card/40 border-border backdrop-blur-md border-t-2 border-primary/20 p-6 space-y-3">
                      <ConfigBlock label="Search Mode" value="INDUSTRIAL AI SCORING" />
                      <ConfigBlock label="Concurrency" value="HEADLESS PLAYWRIGHT" />
                      <ConfigBlock label="Engine" value="LLAMA-3.1 RESILIENT" />
                    </Card>
                    <Card className="bg-card/40 border-border backdrop-blur-md p-6">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Search History</p>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black tracking-tighter text-foreground leading-none">{sessions.length}</span>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">
                          {sessions.filter(s => s.status === "completed").length} SUCCESSFUL
                        </span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────── INITIATION VIEW (The "Form" view) ────── */}
          {view === "initiate" && (
            <InitiationView
              targetRole={targetRole}
              setTargetRole={setTargetRole}
              location={location}
              setLocation={setLocation}
              platform={platform}
              setPlatform={setPlatform}
              activePlatforms={activePlatforms}
              onAbort={() => setView("operational")}
              onExecute={startSearch}
            />
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
