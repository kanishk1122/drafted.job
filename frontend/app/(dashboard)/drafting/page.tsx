"use client";

import { useEffect, useCallback, useState } from "react";
import { Play, Layers, RefreshCcw, ArrowRight, Zap } from "lucide-react";
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
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("India");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const { sessions, loading: sessionsLoading } = useAppSelector((state: RootState) => state.browser);
  const [activeMission, setActiveMission] = useState<any>(null);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

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

    // Check for active/last search in localStorage
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) setActiveMission(parsed);
    }
  }, [dispatch, context]);

  const loadSessions = useCallback(async () => {
    if (user.userEmail) {
      dispatch(fetchBrowserSessions(user.userEmail));
    }
  }, [dispatch, user.userEmail]);

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
    <div className="relative h-full p-2 md:p-4">
      <AnimatePresence mode="wait">

        {/* ────── ACTIVE SEARCH OVERLAY ────── */}
        {activeMission && view === "operational" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-4 top-4 z-50 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-2xl shadow-primary/20 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-primary/20">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase leading-none tracking-widest text-primary">Active Search</p>
                <p className="mt-1 font-mono text-[10px] lowercase text-muted-foreground">
                  {activeMission.targetRole} @ {activeMission.platform}
                </p>
              </div>
            </div>
            <Button onClick={resumeMission} className="h-10 gap-2 rounded-xl px-6 text-[9px] font-black uppercase tracking-widest">
              RESUME SEARCH <ArrowRight size={14} />
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
            className="h-full overflow-y-auto pb-12 pt-16 no-scrollbar md:pt-4"
          >
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground">Job Search</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Find & Track Opportunities
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSessions}
                  disabled={sessionsLoading}
                  className="h-10 rounded-sm border-border/60 px-4 text-[9px] font-black uppercase tracking-widest"
                >
                  <RefreshCcw size={12} className={`mr-2 ${sessionsLoading ? "animate-spin" : ""}`} /> REFRESH
                </Button>
                <Button
                  onClick={() => setView("initiate")}
                  size="sm"
                  className="group h-10 rounded-sm bg-primary px-6 text-[10px] font-black uppercase leading-none tracking-widest text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
                >
                  START NEW SEARCH <Play size={14} className="ml-2 transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column */}
              <div className="lg:col-span-1">
                <Card className="h-fit overflow-hidden border-border bg-card/40 backdrop-blur-md">
                  <CardHeader className="border-b border-border/40 bg-muted/20 p-6">
                    <CardTitle className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em]">
                      <Layers size={14} className="text-primary" /> Supported Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <PlatformList />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8 lg:col-span-2">
                <SearchHistory
                  sessions={sessions}
                  onDelete={(id) => {
                    if (user.userEmail) {
                      dispatch(deleteBrowserSession({ sessionId: id, userId: user.userEmail }));
                    }
                  }}
                  onClearAll={() => { }}
                  onRestart={handleRestartSession}
                />
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card className="space-y-3 border-t-2 border-border border-t-primary/20 bg-card/40 p-6 backdrop-blur-md">
                    <p className="mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Search Settings</p>
                    <ConfigBlock label="Search Mode" value="INTELLIGENT SCORING" />
                    <ConfigBlock label="Data Extraction" value="AUTOMATED SCANNING" />
                    <ConfigBlock label="Analysis" value="LLAMA 3.1" />
                  </Card>
                  
                  <Card className="border-border bg-card/40 p-6 backdrop-blur-md">
                    <p className="mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Search Overview</p>
                    <div className="flex items-end gap-3">
                      <span className="leading-none text-foreground tabular-nums text-4xl font-black tracking-tighter">
                        {sessions.length}
                      </span>
                      <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-green-500">
                        {sessions.filter(s => s.status === "completed").length} SUCCESSFUL
                      </span>
                    </div>
                  </Card>
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