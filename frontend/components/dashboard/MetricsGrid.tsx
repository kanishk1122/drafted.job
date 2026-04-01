"use client";

import React from "react";
import { 
  Search, 
  Zap, 
  Activity, 
  Briefcase, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchDashboardStats } from "@/lib/redux/slices/pipelineSlice";
import { RootState } from "@/lib/redux/store";
import { Skeleton } from "@/components/ui/skeleton";

function MetricCard({ icon, label, value, trend, color, isLoading }: any) {
  const colorMap: any = {
    orange: "text-orange-500 [text-shadow:0_0_15px_rgba(249,115,22,0.5)]",
    blue: "text-blue-500 [text-shadow:0_0_15px_rgba(59,130,246,0.5)]",
    green: "text-green-500 [text-shadow:0_0_15px_rgba(34,197,94,0.5)]",
    purple: "text-purple-500 [text-shadow:0_0_15px_rgba(168,85,247,0.5)]",
  };

  const bgMap: any = {
    orange: "bg-transparent border-orange-500/20",
    blue: "bg-transparent border-blue-500/20",
    green: "bg-transparent border-green-500/20",
    purple: "bg-transparent border-purple-500/20",
  };

  const glowMap: any = {
    blue: "text-blue-400 [text-shadow:0_0_15px_rgba(59,130,246,0.5)]",
    orange: "text-orange-400 [text-shadow:0_0_15px_rgba(249,115,22,0.5)]",
    green: "text-green-400 [text-shadow:0_0_15px_rgba(34,197,94,0.5)]",
    purple: "text-purple-400 [text-shadow:0_0_15px_rgba(168,85,247,0.5)]",
  };

  return (
    <Card className="bg-card/40 border-border backdrop-blur-sm overflow-hidden group transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("flex items-center justify-center p-2.5 rounded-xl border shrink-0 h-10 w-10", bgMap[color])}>
            {icon}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{label}</span>
            <div className={cn("text-4xl font-black tracking-tighter italic transition-all duration-300 group-hover:scale-105", glowMap[color])}>
              {isLoading ? <Skeleton className="h-10 w-24 bg-white/5" /> : value}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-border/40">
           <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-tight", colorMap[color])}>
              <TrendingUp size={12} />
              {isLoading ? <Skeleton className="h-3 w-32 bg-white/5" /> : trend}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsGrid() {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state: RootState) => state.pipeline);

  useEffect(() => {
    dispatch(fetchDashboardStats() as any);
  }, [dispatch]);

  const cards = [
    {
      icon: <Search size={20} />,
      label: "Jobs Discovered",
      value: stats?.jobs_discovered?.value || "0",
      trend: stats?.jobs_discovered?.change || "Calculating...",
      color: "blue"
    },
    {
      icon: <Zap size={20} />,
      label: "Forms Submitted",
      value: stats?.forms_submitted?.value || "0",
      trend: stats?.forms_submitted?.change || "Calculating...",
      color: "orange"
    },
    {
      icon: <Activity size={20} />,
      label: "Positive Responses",
      value: stats?.positive_responses?.value || "0",
      trend: stats?.positive_responses?.change || "Calculating...",
      color: "green"
    },
    {
      icon: <Briefcase size={20} />,
      label: "Interviews Done",
      value: stats?.interviews_done?.value || "0",
      trend: stats?.interviews_done?.change || "Calculating...",
      color: "purple"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
