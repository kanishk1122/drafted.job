"use client";

import React from "react";
import { Play, Layers, History, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

// Modular Components
import { PlatformListItem, platformTargets } from "@/components/drafting/PlatformList";
import { SearchHistory, initialSessions, SearchSession } from "@/components/drafting/SearchHistory";
import { ConfigBlock } from "@/components/drafting/MissionConfig";
import { InitiationView } from "@/components/drafting/InitiationView";
import { SearchingView } from "@/components/drafting/SearchingView";

export default function DraftingPage() {
  const [view, setView] = React.useState<"operational" | "initiate" | "searching">("operational");
  const [jobDescription, setJobDescription] = React.useState("");
  const [searchProgress, setSearchProgress] = React.useState(0);
  const [sessions, setSessions] = React.useState<SearchSession[]>(initialSessions);

  const startSearch = () => {
    setView("searching");
    setSearchProgress(0);
    
    // Simulate Search Progress
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishSearch();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const finishSearch = () => {
    setTimeout(() => {
      const newSession: SearchSession = {
        id: Date.now(),
        name: jobDescription.slice(0, 20) + " Search",
        status: "completed" as const,
        date: "Just Now",
        totalJobs: Math.floor(Math.random() * 100) + 20,
        breakdown: [
          { platform: "LinkedIn", logo: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=128", count: Math.floor(Math.random() * 30) },
          { platform: "Naukri", logo: "https://www.google.com/s2/favicons?domain=naukri.com&sz=128", count: Math.floor(Math.random() * 50) },
        ]
      };
      setSessions([newSession, ...sessions]);
      setView("operational");
      setJobDescription("");
    }, 1000);
  };

  const handleDeleteSession = (id: number | string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleClearAll = () => {
    setSessions([]);
  };

  const handleRestartSession = (session: SearchSession) => {
    setJobDescription(session.name.replace(" Search", ""));
    setView("initiate");
  };

  return (
    <DashboardLayout>
      <div className="relative h-full overflow-hidden  p-2">
        <AnimatePresence mode="wait">
          {view === "operational" && (
            <motion.div 
              key="operational-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto no-scrollbar pb-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground">
                    Career Search
                  </h1>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Search Environment Control</p>
                </div>
                <Button 
                  onClick={() => setView("initiate")}
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 rounded-sm shadow-xl shadow-primary/20 tracking-widest text-[10px] uppercase h-10 group leading-none"
                >
                   BEGIN JOB SCAN <Play size={14} className="ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1">
                    <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden h-fit">
                      <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
                         <CardTitle className="text-[12px] font-black flex items-center gap-2.5 tracking-[0.2em] uppercase">
                            <Layers size={14} className="text-primary" />
                            Search Channels
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                         <div className="divide-y divide-border/20">
                            {platformTargets.map((platform) => (
                              <PlatformListItem key={platform.id} platform={platform} />
                            ))}
                         </div>
                      </CardContent>
                      <div className="p-4 border-t border-border/20">
                         <Button variant="outline" className="w-full text-[9px] font-black tracking-widest uppercase h-9">
                            CONFIGURE TARGETS
                         </Button>
                      </div>
                    </Card>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <SearchHistory 
                      sessions={sessions} 
                      onDelete={handleDeleteSession}
                      onClearAll={handleClearAll}
                      onRestart={handleRestartSession}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Card className="bg-card/40 border-border backdrop-blur-md relative group border-t-2 border-primary/20 p-6 space-y-3">
                            <ConfigBlock label="Search Depth" value="Lvl 4 (Experimental)" />
                            <ConfigBlock label="Auto-Filter" value="Active (India Market)" />
                            <ConfigBlock label="Sync Rate" value="0.5ms REALTIME" />
                       </Card>
                       <Card className="bg-card/40 border-border backdrop-blur-md p-6">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Search Matching</p>
                            <div className="flex items-end gap-3">
                               <span className="text-4xl font-black tracking-tighter text-foreground leading-none">98.2</span>
                               <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">+4.2 PRECISION</span>
                            </div>
                       </Card>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {view === "initiate" && (
            <InitiationView 
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onAbort={() => setView("operational")}
              onExecute={startSearch}
            />
          )}

          {view === "searching" && (
            <SearchingView searchProgress={searchProgress} />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

