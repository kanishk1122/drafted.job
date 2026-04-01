"use client";

import React, { useEffect } from "react";
import {
   ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchJobs, fetchJobMetrics } from "@/lib/redux/slices/jobSlice";
import { getCurrentISTTime } from "@/lib/utils";

// Components
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { InsightsGrid } from "@/components/dashboard/InsightsGrid";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import TacticalRecommendations from "@/components/dashboard/TacticalRecommendations";

export default function DashboardPage() {
   const dispatch = useAppDispatch();

   const handleRescan = () => {
      dispatch(fetchJobMetrics());
      dispatch(fetchJobs({ limit: 10, sort_by: "newest" }));
   };

   useEffect(() => {
      const bootstrapDashboard = async () => {
         await Promise.all([
            dispatch(fetchJobMetrics()),
            dispatch(fetchJobs({ limit: 10, sort_by: "newest" }))
         ]);
      };

      bootstrapDashboard();
   }, [dispatch]);

   return (
      <div className="space-y-8 pb-12">
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
                  <span className="text-[10px] font-black text-primary uppercase tabular-nums">DATA SYNCED AT {getCurrentISTTime()}</span>
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

         <div className="space-y-8">
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
                  <TacticalRecommendations />
               </div>
            </div>
         </div>
      </div>
   );
}
