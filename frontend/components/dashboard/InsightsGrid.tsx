"use client";

import React from "react";
import { 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Clock, 
  Zap 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function InsightMiniCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  return (
    <Card className="bg-card/40 border-border group hover:border-primary/20 transition-all duration-300 backdrop-blur-sm overflow-hidden min-h-[100px] flex flex-col justify-center">
      <CardContent className="p-5 flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight">
            {label}
          </p>
          <div className="text-3xl font-black italic text-foreground tracking-tighter tabular-nums leading-none">
            {value}
          </div>
        </div>
        <div className={cn("flex items-center justify-center h-11 w-11 rounded-xl border-2 shrink-0 shadow-lg shadow-black/40 -mt-1", colorMap[color])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

import { useAppSelector } from "@/lib/redux/store";

export function InsightsGrid() {
  const { insights, insightsLoading } = useAppSelector((state) => state.profile);

  if (insightsLoading && !insights) {
    return (
      <div className="h-64 flex items-center justify-center bg-card/20 rounded-3xl border border-border/40 animate-pulse">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Decrypting Insights...</span>
      </div>
    );
  }

  const authority = insights?.profile_authority || 0;
  const marketDemand = insights?.market_demand || [
     { label: "Python / Backend", status: "Extreme", color: "blue" },
     { label: "Cloud Systems", status: "Surging", color: "primary" },
     { label: "Front End UI", status: "Stable", color: "muted" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
             <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 tracking-widest uppercase">
                   <ShieldCheck size={14} className="text-green-500" />
                   Profile Authority
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="flex items-end gap-3 mb-6">
                   <div className="text-6xl font-black tracking-tighter text-foreground italic flex items-start">
                     {authority} <span className="text-xl mt-2 ml-2">%</span>
                   </div>
                   <div className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <TrendingUp size={10} /> {insights?.authority_boost || "+0% TACTICAL"}
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all duration-1000" 
                        style={{ width: `${authority}%` }}
                      />
                   </div>
                   <p className="text-[10px] font-medium text-muted-foreground uppercase leading-relaxed tracking-wider">
                      {insights?.authority_recommendation || "Optimization parameters syncing..."}
                   </p>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
             <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 tracking-widest uppercase">
                   <TrendingUp size={14} className="text-blue-500" />
                   Market Demand
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-4">
                   {marketDemand.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between group/item">
                         <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover/item:text-foreground transition-colors">
                           {item.label}
                         </span>
                         <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm",
                            item.color === 'blue' && "text-blue-500 bg-blue-500/10",
                            item.color === 'primary' && "text-primary bg-primary/10",
                            item.color === 'muted' && "text-muted-foreground bg-muted"
                         )}>
                           {item.status}
                         </span>
                      </div>
                   ))}
                   <div className="pt-6 border-t border-border/40 mt-4">
                      <Button variant="ghost" size="sm" className="w-full text-[9px] font-black tracking-[0.2em] uppercase hover:bg-muted/60 border border-border/40">
                         ANALYZE NEW SECTORS
                      </Button>
                   </div>
                </div>
             </CardContent>
          </Card>
       </div>
    </div>
  );
}
