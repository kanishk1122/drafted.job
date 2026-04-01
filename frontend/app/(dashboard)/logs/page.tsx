"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  Clock,
  RefreshCcw,
  Activity,
  Link2,
  Link2Off,
  Cpu,
  Trash2,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/redux/store";
import { fetchBrowserSessions, deleteBrowserSession } from "@/lib/redux/slices/browserSlice";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

// 1. Define clear, understandable update types
type UpdateType = 'discovery' | 'draft_ready' | 'status_change' | 'action_needed' | 'system';

interface ActivityUpdate {
  id: string;
  type: UpdateType;
  title: string;
  message: string;
  timestamp: string;
  actionText?: string;
  actionHref?: string;
  jobContext?: {
    role: string;
    company: string;
  };
  status?: string;
}

export default function UpdatesPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth);
  const { sessions, loading: sessionsLoading } = useAppSelector((state: RootState) => state.browser);
  const { context } = useAppSelector((state: RootState) => state.profile);

  const loadData = useCallback(() => {
    if (user.userEmail) {
      dispatch(fetchBrowserSessions(user.userEmail));
      dispatch(fetchProfile());
    }
  }, [dispatch, user.userEmail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Convert real scout sessions into plane-language activity updates
  const realUpdates: ActivityUpdate[] = useMemo(() => {
    return sessions.map((s: any) => ({
      id: `session_${s.id}`,
      type: s.status === 'failed' ? 'action_needed' : 'discovery',
      title: s.status === 'failed' ? "Search Interrupted" : "New Jobs Found",
      message: s.status === 'failed' 
        ? `We ran into an issue while searching on ${s.name.split(' · ')[1] || 'LinkedIn'}. Your connection might need a quick check.`
        : `Our automated scout successfully found ${s.totalJobs} new positions on ${s.name.split(' · ')[1] || 'LinkedIn'}.`,
      timestamp: s.date,
      actionText: "View in Vault",
      actionHref: "/vault",
      jobContext: s.totalJobs > 0 ? { role: "Multiple Roles", company: s.name.split(' · ')[1] || "LinkedIn" } : undefined,
      status: s.status
    }));
  }, [sessions]);

  // Add some helpful generic "Drafting" and "Status" mock hints if feed is low
  const supplementaryUpdates: ActivityUpdate[] = [
    {
      id: "mock_1",
      type: "draft_ready",
      title: "Cover Letter Optimized",
      message: "One of your draft cover letters was automatically refined using your latest project experience.",
      timestamp: "Today",
      actionText: "Review Draft",
      actionHref: "/drafting",
      jobContext: { role: "Senior Developer", company: "System Analytics" }
    },
    {
      id: "mock_2",
      type: "action_needed",
      title: "Profile Sync Recommended",
      message: "It's been a few days since your last resume upload. Re-sync to keep search results fresh.",
      timestamp: "Yesterday",
      actionText: "Sync Now",
      actionHref: "/profile"
    }
  ];

  const allUpdates = useMemo(() => {
    const combined = [...realUpdates];
    if (combined.length < 5) combined.push(...supplementaryUpdates);
    return combined;
  }, [realUpdates]);

  // Helpers
  const getUpdateStyling = (type: UpdateType) => {
    switch (type) {
      case 'discovery':
        return { icon: <Sparkles size={20} />, colorClass: "text-blue-500", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" };
      case 'draft_ready':
        return { icon: <FileText size={20} />, colorClass: "text-purple-500", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/20" };
      case 'action_needed':
        return { icon: <AlertCircle size={20} />, colorClass: "text-orange-500", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" };
      case 'status_change':
        return { icon: <CheckCircle2 size={20} />, colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" };
      default:
        return { icon: <Activity size={20} />, colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "border-primary/20" };
    }
  };

  const PLATFORMS = ["linkedin", "naukri", "indeed", "foundit", "glassdoor", "ambitionbox"];
  const activeCount = useMemo(() => 
    PLATFORMS.filter(p => (context as any)?.[`${p}_active`] === true).length,
  [context]);
  const healthPercent = (activeCount / PLATFORMS.length) * 100;

  return (
    <div className="h-full flex flex-col xl:flex-row gap-10 max-w-7xl mx-auto w-full pb-20">
      
      {/* Main Content Area: The Timeline Feed */}
      <div className="flex-1 space-y-10">
        <div className="pt-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-foreground mb-3 italic">
            Activity <span className="text-primary italic">Feed</span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">
            Plain-language updates on job discoveries, AI drafts, and mission status.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Connector */}
          <div className="absolute left-[35px] top-6 bottom-0 w-[2px] bg-border/40 rounded-full" />

          <ScrollArea className="h-[75vh] pr-4">
            <div className="space-y-8 pr-2">
              <AnimatePresence mode="popLayout">
                {allUpdates.map((update, index) => {
                  const style = getUpdateStyling(update.type);
                  return (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6 relative group"
                    >
                      {/* Timeline Node Icon */}
                      <div className={cn(
                        "relative z-10 shrink-0 w-16 h-16 rounded-full border-4 border-background flex items-center justify-center shadow-2xl transition-all duration-300",
                        style.bgClass, style.colorClass
                      )}>
                        {style.icon}
                      </div>

                      {/* Content Card */}
                      <Card className="flex-1 bg-card/40 backdrop-blur-xl border-border/40 shadow-xl overflow-hidden rounded-[2.5rem] hover:border-primary/30 transition-all">
                        <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                               <Badge variant="secondary" className={cn("border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1", style.bgClass, style.colorClass)}>
                                  {update.type.replace('_', ' ')}
                               </Badge>
                               <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                  <Clock size={12} /> {update.timestamp}
                               </span>
                            </div>

                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">{update.title}</h3>
                            <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                               {update.message}
                            </p>

                            {update.jobContext && (
                              <div className="flex items-center gap-3 mt-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
                                 <Briefcase size={16} className="text-primary opacity-60 shrink-0" />
                                 <p className="text-[11px] font-black text-foreground uppercase tracking-tight">
                                    {update.jobContext.role} <span className="text-muted-foreground opacity-60 mx-1">at</span> {update.jobContext.company}
                                 </p>
                              </div>
                            )}
                          </div>

                          {update.actionText && (
                            <div className="shrink-0 w-full md:w-auto">
                               <Link href={update.actionHref || "#"}>
                                 <Button className="w-full md:w-auto h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] gap-2 shadow-lg shadow-primary/20">
                                    {update.actionText} <ChevronRight size={14} />
                                 </Button>
                               </Link>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar: System Health & Stats */}
      <div className="w-full xl:w-96 shrink-0 space-y-8">
        
        {/* Real-time Link Monitor */}
        <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
           <CardHeader className="p-8 border-b border-border/20 bg-muted/20">
              <CardTitle className="text-[11px] font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                <Activity size={14} className="text-primary" /> Core Link Status
              </CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black text-muted-foreground uppercase">Network Health</span>
                 <span className={cn("text-xl font-black italic tabular-nums", healthPercent < 50 ? "text-red-500" : "text-green-500")}>
                    {Math.round(healthPercent)}%
                 </span>
              </div>
              <Progress value={healthPercent} className="h-2 bg-muted/40" />
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                 {PLATFORMS.slice(0, 4).map(p => {
                    const active = (context as any)?.[`${p}_active`];
                    return (
                      <div key={p} className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase text-muted-foreground">{p}</span>
                         <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                      </div>
                    );
                 })}
              </div>
              <Link href="/connect">
                 <Button variant="outline" className="w-full mt-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-border hover:bg-muted">
                    MANAGE CONNECTIONS
                 </Button>
              </Link>
           </CardContent>
        </Card>

        {/* AI Processing Readout */}
        <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border-t-2 border-primary/20">
           <CardContent className="p-8 space-y-6 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border-2 border-primary/30 text-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/10 mb-2">
                 <Cpu size={28} />
              </div>
              <div>
                 <h3 className="text-lg font-black italic uppercase tracking-tight">Neural Pulse</h3>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">AI Activity Monitor</p>
              </div>
              <div className="flex items-center justify-center gap-6">
                 <div className="text-center">
                    <p className="text-xl font-black tabular-nums">145</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Refinements</p>
                 </div>
                 <div className="w-px h-8 bg-border/40" />
                 <div className="text-center">
                    <p className="text-xl font-black tabular-nums text-primary">98%</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Efficiency</p>
                 </div>
              </div>
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
