"use client";

import React, { useState } from "react";
import { 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  Terminal, 
  Briefcase, 
  X, 
  Target, 
  Building2, 
  Globe, 
  Sparkles 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatToIST } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { createManualJob } from "@/lib/redux/slices/jobSlice";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function MissionEntryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    platform: "Manual",
    heuristic_score: 85,
    status: "Applied",
    url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createManualJob(formData)).unwrap();
      toast.success("MISSION NODE REGISTERED", {
        description: "Target entity successfully synchronized with private vault."
      });
      onClose();
    } catch (err: any) {
      toast.error("PROTOCOL BREACH", {
        description: err.message || "Failed to inject mission record."
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border-2 border-border/40 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black tracking-tighter uppercase text-primary flex items-center gap-3">
                      <Target className="h-6 w-6" /> Manual Mission Entry
                   </h2>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Injecting target node into search funnel</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/50">
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Entity Name</label>
                    <div className="relative group">
                       <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                         required
                         className="w-full bg-muted/20 border-2 border-border/40 rounded-2xl pl-12 pr-4 h-14 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all"
                         placeholder="e.g. GOOGLE"
                         value={formData.company}
                         onChange={(e) => setFormData({...formData, company: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Role</label>
                    <div className="relative group">
                       <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                         required
                         className="w-full bg-muted/20 border-2 border-border/40 rounded-2xl pl-12 pr-4 h-14 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all"
                         placeholder="e.g. SRE"
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                       />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Intelligence Source</label>
                    <div className="relative group">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                         className="w-full bg-muted/20 border-2 border-border/40 rounded-2xl pl-12 pr-4 h-14 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all"
                         placeholder="e.g. REFERRAL"
                         value={formData.platform}
                         onChange={(e) => setFormData({...formData, platform: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Heuristic Score</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-muted/20 border-2 border-border/40 rounded-2xl px-6 h-14 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all"
                      value={formData.heuristic_score}
                      onChange={(e) => setFormData({...formData, heuristic_score: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Synchronize Mission Node
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ApplicationTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { jobs, loading } = useAppSelector((state) => state.job);
  
  // High-fidelity mission history readout (Recent 10)
  const recentMissions = jobs.slice(0, 10);

  return (
    <>
    <MissionEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    
    <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden relative group">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 p-6">
        <div className="space-y-1">
          <CardTitle className="text-[12px] font-black flex items-center gap-2.5 tracking-[0.2em] uppercase">
            <Terminal size={14} className="text-primary" />
            Mission History Readout
          </CardTitle>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Active Search Funnel</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="sm" 
          className="text-[10px] font-black gap-2 h-8 px-4 tracking-widest uppercase shadow-lg shadow-primary/20"
        >
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
                {loading && jobs.length === 0 ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4"><Skeleton className="h-8 w-full bg-white/5 mx-auto" /></td>
                    </tr>
                  ))
                ) : (
                  recentMissions.map((app) => (
                  <tr key={app.id} className="group/row hover:bg-muted/30 transition-colors duration-300">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center font-black text-xs group-hover/row:border-primary/40 transition-colors">
                          {app.platform[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[120px]">{app.company || "Unknown"}</p>
                          <Badge variant="ghost" className="text-[8px] h-4 font-black p-0 opacity-40 uppercase">{app.platform}</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black uppercase tracking-tight text-muted-foreground truncate max-w-[150px]">{app.title}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${app.heuristic_score}%` }} />
                        </div>
                        <span className="text-[10px] font-black italic">{app.heuristic_score}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                       <Badge 
                          className={cn(
                             "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border",
                             app.status === "Interview" || app.status === "Interviewing" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                             app.status === "offer" || app.status === "Offered" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                             app.status === "rejected" || app.status === "Rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                             "bg-primary/10 text-primary border-primary/20"
                          )}
                       >
                          {app.status}
                       </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-[10px] font-black font-mono text-muted-foreground">
                        {app.created_at ? formatToIST(app.created_at, false) : "LOGGED"}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={!app.url}
                        onClick={() => app.url && window.open(app.url, '_blank', 'noopener,noreferrer')}
                        className="h-8 w-8 hover:bg-muted group/btn"
                      >
                        <ExternalLink size={14} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
                      </Button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Briefcase size={12} className="text-primary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active search Funnel: {jobs.length} nodes registered</span>
         </div>
         <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black gap-2 opacity-60 hover:opacity-100 uppercase italic">
            Analyze history <ChevronRight size={10} />
         </Button>
      </div>
    </Card>
    </>
  );
}
