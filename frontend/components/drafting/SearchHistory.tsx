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
import { Badge } from "@/components/ui/badge";
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

export function SessionItem({ session, onRestart, onDelete }: SessionItemProps) {
  return (
    <div className="group flex flex-col space-y-4 p-5 transition-colors hover:bg-muted/50">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-fit flex-1 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
            <Layers size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-foreground">
                {session.name}
              </h4>
              {session.status === "active" ? (
                <RotateCcw size={14} className="shrink-0 animate-spin text-primary" />
              ) : session.status === "completed" ? (
                <CheckCircle2 size={14} className="shrink-0 text-green-600" />
              ) : (
                <AlertCircle 
                  size={14} 
                  className={cn(
                    "shrink-0", 
                    session.status === 'idle' ? "text-muted-foreground" : "text-red-600"
                  )} 
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 shrink-0 px-2 text-xs font-medium capitalize",
                  session.status === 'active' ? "bg-primary/10 text-primary" :
                  session.status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  session.status === 'idle' ? "bg-muted text-muted-foreground" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {session.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {session.date}
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex min-w-fit shrink-0 flex-col items-end gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-foreground">
              {session.totalJobs}
            </span>
            <span className="text-sm text-muted-foreground">jobs</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onRestart?.(session); }}
              title="Restart Search"
            >
              <RotateCcw size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(session.id); }}
              title="Delete History"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Platform Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {session.breakdown.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-md border bg-background p-2 shadow-sm"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5">
              <img src={item.logo} alt={item.platform} className="h-full w-full object-contain" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-foreground">
                {item.count}
              </span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {item.platform}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SearchHistoryProps {
  sessions: SearchSession[];
  onRestart?: (s: SearchSession) => void;
  onDelete?: (id: number | string) => void;
  onClearAll?: () => void;
}

export function SearchHistory({ sessions, onRestart, onDelete, onClearAll }: SearchHistoryProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History size={18} className="text-muted-foreground" />
          Search History
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
          className="h-8 text-xs text-muted-foreground hover:text-destructive"
        >
          Clear All
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[460px]">
          {sessions.length > 0 ? (
            <div className="divide-y">
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
            <div className="flex h-full flex-col items-center justify-center space-y-3 p-12 text-center text-muted-foreground">
              <History size={40} className="opacity-20" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">No search history</p>
                <p className="text-sm">Your past job searches will appear here.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}