"use client";

import React from "react";
import { 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  Terminal, 
  Briefcase 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const applications = [
  { id: 1, company: "Google", role: "Frontend Engineer", status: "Applied", date: "2024-03-24", match: "94%" },
  { id: 2, company: "Amazon", role: "Cloud Solution Architect", status: "Interviewing", date: "2024-03-22", match: "88%" },
  { id: 3, company: "Meta", role: "Product Designer", status: "Applied", date: "2024-03-21", match: "82%" },
  { id: 4, company: "Netflix", role: "Senior Engineer", status: "Offered", date: "2024-03-18", match: "97%" },
  { id: 5, company: "Apple", role: "iOS Developer", status: "Rejected", date: "2024-03-15", match: "91%" },
  { id: 6, company: "Microsoft", role: "Backend Engineer", status: "Applied", date: "2024-03-14", match: "85%" },
  { id: 7, company: "Tesla", role: "Fullstack Developer", status: "Applied", date: "2024-03-12", match: "89%" },
];

export function ApplicationTable() {
  return (
    <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden relative group">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 p-6">
        <div className="space-y-1">
          <CardTitle className="text-[12px] font-black flex items-center gap-2.5 tracking-[0.2em] uppercase">
            <Terminal size={14} className="text-primary" />
            Manual App Tracker
          </CardTitle>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Active Search Funnel</p>
        </div>
        <Button size="sm" className="text-[10px] font-black gap-2 h-8 px-4 tracking-widest uppercase shadow-lg shadow-primary/20">
          <Plus size={14} /> NEW ENTRY
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-border/40">
                  <th className="text-left p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Entity</th>
                  <th className="text-left p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Position</th>
                  <th className="text-left p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Match Score</th>
                  <th className="text-left p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-left p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date Logged</th>
                  <th className="text-center p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {applications.map((app) => (
                  <tr key={app.id} className="group/row hover:bg-muted/30 transition-colors duration-300">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center font-black text-xs group-hover/row:border-primary/40 transition-colors">
                          {app.company[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-foreground">{app.company}</p>
                          <Badge variant="ghost" className="text-[8px] h-4 font-black p-0 opacity-40 uppercase">Verified</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black uppercase tracking-tight text-muted-foreground">{app.role}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: app.match }} />
                        </div>
                        <span className="text-[10px] font-black italic">{app.match}</span>
                      </div>
                    </td>
                    <td className="p-4">
                       <Badge 
                          className={cn(
                             "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border",
                             app.status === "Interviewing" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                             app.status === "Offered" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                             app.status === "Rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                             "bg-primary/10 text-primary border-primary/20"
                          )}
                       >
                          {app.status}
                       </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-[10px] font-black font-mono text-muted-foreground">{app.date}</p>
                    </td>
                    <td className="p-4 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted group/btn">
                        <ExternalLink size={14} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Briefcase size={12} className="text-primary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active funnel: 24 Entities</span>
         </div>
         <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black gap-2 opacity-60 hover:opacity-100 uppercase italic">
            Analyze history <ChevronRight size={10} />
         </Button>
      </div>
    </Card>
  );
}
