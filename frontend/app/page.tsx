"use client";

import React from "react";
import { 
  Plus, 
  Brain, 
  ChevronRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  MessageSquare,
  ArrowUpRight,
  Terminal,
  ExternalLink,
  Briefcase
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchJobs, fetchJobMetrics } from "@/lib/redux/slices/jobSlice";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Components
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { InsightsGrid } from "@/components/dashboard/InsightsGrid";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const handleRescan = () => {
    // Explicitly bypass caching by triggering the thunks (they only skip if condition returns false)
    // To force we could reset state or just trust the fetch for now as 'manual'
    dispatch(fetchJobMetrics());
    dispatch(fetchJobs({ limit: 10, sort_by: "newest" }));
  };

  useEffect(() => {
     // Bootstrap global telemetry and recent mission history
     // Both utilize Redux caching 'condition' blocks to skip unnecessary network traffic
     const bootstrapDashboard = async () => {
        await Promise.all([
           dispatch(fetchJobMetrics()),
           dispatch(fetchJobs({ limit: 10, sort_by: "newest" }))
        ]);
     };

     bootstrapDashboard();
  }, [dispatch]);

  const { metrics } = useAppSelector((state) => state.job);

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground -ml-1 italic">
            Draft Deck
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2 text-right">
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-60 italic">Telemetry Uplink Active</span>
             <span className="text-[10px] font-black text-primary uppercase tabular-nums">DATA SYNCED AT {new Date().toLocaleTimeString().split(' ')[0]}</span>
          </div>
          <Button 
            onClick={handleRescan}
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 rounded-sm shadow-lg shadow-primary/20 tracking-widest text-[10px] uppercase h-10 group"
          >
             TRIGGER RESCAN <ArrowUpRight size={14} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="space-y-8 pb-12">
        {/* Top Level Metrics */}
        <MetricsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
             {/* Activity Analytics Chart */}
             <ActivityChart />

             {/* Manual Tracking Table */}
             <ApplicationTable />
          </div>

          {/* Side Intelligence Column */}
          <div className="space-y-8">
             <InsightsGrid />

             <Card className="bg-card/40 border-primary/20 backdrop-blur-md overflow-hidden relative border-t-2">
                <CardHeader className="p-5 border-b border-border/40 bg-primary/5">
                   <CardTitle className="text-[10px] font-black flex items-center gap-2.5 tracking-widest uppercase text-primary">
                      <Brain size={14} />
                      Tactical Recommendations
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border/20">
                      <RecommendationItem 
                         icon={<Cpu size={14} />} 
                         title="Skill Gap Detected" 
                         desc="Senior roles in your sector now prioritize 'Redis'. Add to profile." 
                      />
                      <RecommendationItem 
                         icon={<MessageSquare size={14} />} 
                         title="Follow-up Required" 
                         desc="Amazon Solutions wait time exceeded 48h. Send nudge." 
                      />
                      <RecommendationItem 
                         icon={<Layers size={14} />} 
                         title="Portfolio Sync" 
                         desc="3 new GitHub contributions detected. Update resume." 
                      />
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RecommendationItem({ icon, title, desc }: any) {
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
       <div className="flex gap-4">
          <div className="mt-1 text-primary p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
             {icon}
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase text-foreground/90 tracking-tight">{title}</p>
             <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wider">{desc}</p>
          </div>
       </div>
    </div>
  );
}
