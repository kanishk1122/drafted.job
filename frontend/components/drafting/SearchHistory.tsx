"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Layers, CheckCircle2, AlertCircle, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

export interface SearchSession {
  id: number | string;
  name: string;
  status: "completed" | "failed";
  error?: string;
  date: string;
  totalJobs: number;
  breakdown: {
    platform: string;
    logo: string;
    count: number;
  }[];
}



export function SessionItem({ session, onRestart, onDelete }: { session: SearchSession; onRestart?: (s: SearchSession) => void; onDelete?: (id: number | string) => void }) {
  return (
    <div className="p-5 hover:bg-muted/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
      {/* Scanner line effect - FIXED: Goes all the way down */}
      <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-primary/20 to-transparent top-0 -translate-y-full group-hover:translate-y-[400px] transition-transform duration-[2000ms] ease-linear pointer-events-none opacity-40" />

      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/10 transition-colors">
              <Layers size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest truncate group-hover:text-primary transition-colors">
                  {session.name}
                </h4>
                {session.status === "completed" ? (
                  <CheckCircle2 size={10} className="text-green-500 opacity-60" />
                ) : (
                  <AlertCircle size={10} className="text-red-500 opacity-60" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {session.date}
                </p>
                {session.status === "failed" && (
                  <Badge
                    variant="ghost"
                    className="text-[8px] h-4 font-black bg-red-500/10 text-red-500 border-none px-1.5 uppercase tracking-tighter rounded-sm"
                  >
                    {session.error}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-xl font-black tracking-tighter text-foreground leading-none tabular-nums">
              {session.totalJobs} <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Jobs</span>
            </div>
            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => onRestart?.(session)} className="p-1 hover:text-primary transition-colors" title="Restart Search">
                  <RotateCcw size={12} />
               </button>
               <button onClick={() => onDelete?.(session.id)} className="p-1 hover:text-red-500 transition-colors" title="Delete History">
                  <Trash2 size={12} />
               </button>
            </div>
          </div>
        </div>

        {/* Platform Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {session.breakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 bg-muted/20 p-2 rounded-lg border border-border/40 hover:border-primary/20 transition-all hover:bg-muted/40 shadow-sm"
            >
              <div className="h-5 w-5 rounded bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm">
                <img src={item.logo} alt={item.platform} className="size-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black tabular-nums text-foreground leading-none">
                  {item.count}
                </span>
                <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                  {item.platform}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SearchHistory({ sessions, onRestart, onDelete, onClearAll }: { 
  sessions: SearchSession[]; 
  onRestart?: (s: SearchSession) => void; 
  onDelete?: (id: number | string) => void;
  onClearAll?: () => void;
}) {
  return (
    <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden relative group">
      <CardHeader className="p-6 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
        <CardTitle className="text-[12px] font-black flex items-center gap-2.5 tracking-[0.2em] uppercase">
          <History size={14} className="text-primary" />
          SEARCH HISTORY
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
          className="h-6 text-[8px] font-black text-muted-foreground uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          CLEAR ALL
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[460px]">
          {sessions.length > 0 ? (
            <div className="divide-y divide-border/20">
              {sessions.map((session) => (
                <SessionItem 
                  key={session.id} 
                  session={session} 
                  onRestart={onRestart}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-40">
              <History size={48} className="text-muted-foreground stroke-[1]" />
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest font-black">History Archive Empty</p>
                 <p className="text-[9px] text-muted-foreground">Perform a new Job Scan to initiate archival data.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
