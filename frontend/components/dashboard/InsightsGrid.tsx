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

export function InsightsGrid() {
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
                     92 <span className="text-xl mt-2 ml-2">%</span>
                   </div>
                   <div className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <TrendingUp size={10} /> +4% TACTICAL BOOST
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[92%] shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all duration-1000" />
                   </div>
                   <p className="text-[10px] font-medium text-muted-foreground uppercase leading-relaxed tracking-wider">
                      Your profile authority is optimized for Senior Backend roles. 
                      <span className="text-foreground font-black ml-1 border-b border-primary/40">Update 'Cloud Security' for +5% gain.</span>
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
                   <div className="flex items-center justify-between group/item">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover/item:text-foreground transition-colors">Python / Backend</span>
                      <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded-sm">Extreme</span>
                   </div>
                   <div className="flex items-center justify-between group/item">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover/item:text-foreground transition-colors">Cloud Systems</span>
                      <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-sm">Surging</span>
                   </div>
                   <div className="flex items-center justify-between group/item opacity-60">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover/item:text-foreground transition-colors">Front End UI</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-sm">Stable</span>
                   </div>
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
