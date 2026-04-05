"use client";

import React from "react";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Trash2,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface SearchSession {
  id: number | string;
  name: string;
  status: "completed" | "failed" | "active" | "idle";
  error?: string;
  date: string;
  totalJobs: number;
  breakdown: {
    platform: string;
    logo: string;
    count: number;
  }[];
}

interface SessionItemProps {
  session: SearchSession;
  onRestart?: (s: SearchSession) => void;
  onDelete?: (id: number | string) => void;
}



// Keep your existing interfaces (SearchSession, SessionItemProps) here...

export function SessionItem({ session, onRestart, onDelete }: SessionItemProps) {
  return (
    <div className="group relative flex w-full flex-col p-4 sm:p-5 transition-all hover:bg-muted/30 border-b border-border/20 last:border-0 overflow-hidden cursor-pointer">

      {/* --- Top Section: Info & Actions --- */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">

        {/* LEFT SIDE: Constrained width */}
        <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-[calc(100%-220px)]">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-border/60 bg-card shadow-sm group-hover:border-primary/30 transition-all duration-300">
            <Layers size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          <div className="flex flex-col flex-1 min-w-0 gap-1.5 sm:gap-2">
            {/* ADJUSTED FONT SIZE: Changed from overly large/bold to a cleaner, tighter layout */}
            <h4 className="line-clamp-2 break-words text-[13px] sm:text-sm font-bold leading-snug text-foreground/90 pr-2">
              {session.name || "Unnamed Search Mission"}
            </h4>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-background/50 px-2 py-0.5 shadow-sm">
                {session.status === "active" ? (
                  <RotateCcw size={12} className="shrink-0 animate-spin text-primary" />
                ) : session.status === "completed" ? (
                  <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle
                    size={12}
                    className={cn(
                      "shrink-0",
                      session.status === 'idle' ? "text-muted-foreground/40" : "text-red-500"
                    )}
                  />
                )}
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  session.status === 'active' ? "text-primary" :
                    session.status === 'completed' ? "text-emerald-500" :
                      session.status === 'idle' ? "text-muted-foreground/60" : "text-red-500"
                )}>
                  {session.status}
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground/50 truncate">
                {session.date}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Locked Width */}
        <div className="flex w-full sm:w-[210px] shrink-0 items-center justify-between sm:flex-col sm:items-end gap-3 border-t sm:border-0 border-border/10 pt-3 sm:pt-0 mt-2 sm:mt-0">

          <div className="flex items-baseline gap-1.5 bg-background rounded-full px-4 py-1.5 border border-border/50 shadow-sm">
            <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter text-foreground">
              {session.totalJobs || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">jobs</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* FIXED BUTTON COLOR: Explicitly set text, background, and border colors so it never disappears */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-1 sm:flex-none gap-2 rounded-xl border border-primary/20 bg-primary/5 text-primary px-4 font-bold uppercase tracking-wider shadow-sm hover:bg-primary hover:text-white transition-all sm:h-10 cursor-pointer"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRestart?.(session); }}
            >
              <RotateCcw size={14} className="shrink-0" />
              <span className="text-[10px]">Restart</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl border border-transparent text-muted-foreground hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all sm:h-10 sm:w-10 cursor-pointer"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete?.(session.id); }}
              title="Delete Record"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Bottom Section: Platform Breakdown --- */}
      {session.breakdown && session.breakdown.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {session.breakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 px-3 py-1.5 shadow-sm transition-all hover:bg-background hover:border-primary/20 w-fit cursor-pointer"
            >
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-border/10">
                {item.logo ? (
                  <img src={item.logo} alt={item.platform} className="h-full w-full object-contain p-[2px]" />
                ) : (
                  <Layers size={10} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-black text-foreground">
                  {item.count}
                </span>
                <span className="truncate text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                  {item.platform}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SearchHistoryProps {
  sessions: SearchSession[];
  loading?: boolean;
  hasMore?: boolean;
  onRestart?: (s: SearchSession) => void;
  onDelete?: (id: number | string) => void;
  onClearAll?: () => void;
  onLoadMore?: () => void;
}

export function SearchHistory({ 
  sessions, 
  loading, 
  hasMore, 
  onRestart, 
  onDelete, 
  onClearAll,
  onLoadMore 
}: SearchHistoryProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onLoadMore?.();
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <Card className="w-full overflow-hidden border-border/40 shadow-xl bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 bg-muted/10 px-6 py-4 gap-4 w-full">
        <CardTitle className="flex items-center gap-3 text-[12px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-foreground/80">
          <History size={18} className="text-primary" />
          Mission Control History
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="h-9 w-full sm:w-auto border-red-500/20 px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-500/80 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
        >
          PURGE ALL RECORDS
        </Button>
      </CardHeader>

      <CardContent className="p-0 w-full">
        <ScrollArea className="h-[520px] w-full">
          {sessions.length > 0 ? (
            <div className="flex flex-col w-full">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  onRestart={onRestart}
                  onDelete={onDelete}
                />
              ))}
              
              {/* Load More Sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="py-8 flex items-center justify-center">
                  <RotateCcw size={20} className="animate-spin text-primary/40" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-12 text-center text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/30">
                <History size={32} className="opacity-30" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">Mission Logs Empty</p>
                <p className="text-sm max-w-[220px] leading-relaxed mx-auto">System awaiting deployment of recruitment search missions.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}