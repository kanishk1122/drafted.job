"use client";

import React from "react";
import { 
  Activity 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl shadow-black/20">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
           <div className="text-xl font-black text-primary italic leading-none">{payload[0].value}</div>
           <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">Applications</span>
        </div>
      </div>
    );
  }
  return null;
}

export function ActivityChart() {
  const { stats } = useSelector((state: RootState) => state.pipeline);
  
  const chartData = stats?.activity_chart?.points.map(p => ({
    day: p.date,
    apps: p.count
  })) || [];

  return (
    <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden relative group">
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <CardHeader className="p-6 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
         <div className="space-y-1">
            <CardTitle className="text-[10px] font-black flex items-center gap-2.5 tracking-[0.2em] uppercase">
               <Activity size={14} className="text-primary animate-pulse" />
               Application Velocity
            </CardTitle>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">+18% OUTPUT BOOST THIS WEEK</p>
         </div>
         <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] font-black px-2 py-0.5 rounded-sm">7D ACTIVE</Badge>
         </div>
      </CardHeader>
      <CardContent className="px-[0.5px] pt-6">
         <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                     dataKey="day" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }}
                     minTickGap={30}
                     padding={{ left: 0, right: 0 }}
                  />
                  <YAxis 
                     hide={true}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                     type="monotone" 
                     dataKey="apps" 
                     stroke="var(--primary)" 
                     strokeWidth={4}
                     fillOpacity={1} 
                     fill="url(#colorApps)" 
                     activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)', className: "animate-pulse" }}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </CardContent>
    </Card>
  );
}
