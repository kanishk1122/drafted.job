"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   ExternalLink,
   Briefcase,
   Banknote,
   ChevronRight,
   FileText,
   Trash2,
   Loader2,
   ClipboardList
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/services/job-service";
import DraftCLOverlay from "./DraftCLOverlay";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/redux/store";
import { updateJobStatus, fetchJobMetrics } from "@/lib/redux/slices/jobSlice";

interface PositionSpecificationsProps {
   selectedJob: Job | null;
   handleDraftCL: () => void;
   isDraftingCL: boolean;
   generatedCL: string | null;
   setGeneratedCL: (cl: string | null) => void;
}

export default function PositionSpecifications({
   selectedJob,
   handleDraftCL,
   isDraftingCL,
   generatedCL,
   setGeneratedCL
}: PositionSpecificationsProps) {
   const dispatch = useAppDispatch();
   return (
      // 1. Set the root height to exactly 70vh
      <div className="hidden lg:flex flex-1 flex-col relative h-[70vh] w-full">
         <AnimatePresence mode="wait">
            {selectedJob ? (
               <motion.div
                  key={selectedJob.id}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)", transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full flex flex-col"
               >
                  {/* 2. Added overflow-y-auto to the complete Card so everything scrolls together */}
                  <Card className="h-full w-full bg-card/20 border-border/40 backdrop-blur-xl rounded-3xl overflow-y-auto overscroll-contain flex flex-col relative border-2 shadow-2xl no-scrollbar">

                     {/* Visual Header */}
                     <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative p-10 flex items-end border-b border-border/20">
                        <div className="space-y-3 z-10 w-full">
                           <div className="flex items-center justify-between w-full">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary bg-primary/5 font-black uppercase tracking-widest h-6">
                                       ROLE_{selectedJob.id.toString().padStart(3, '0')}
                                    </Badge>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                       PROBED VIA <img src={`https://www.google.com/s2/favicons?domain=${selectedJob.platform.toLowerCase()}.com&sz=128`} className="h-4 w-4 grayscale opacity-60" alt="" /> {selectedJob.platform.toUpperCase()}
                                       <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="ml-2 hover:text-primary transition-colors">
                                          <ExternalLink size={12} />
                                       </a>
                                    </span>
                                 </div>
                                 <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-tight">{selectedJob.title}</h2>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">FIT SCORE</span>
                                 <span className="text-4xl font-black text-primary tabular-nums tracking-tighter shadow-primary/20">{selectedJob.heuristic_score}%</span>
                              </div>
                           </div>
                        </div>
                        {/* Background Texture */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                           <Briefcase size={120} />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent pointer-events-none" />
                     </div>

                     {/* 3. Replaced ScrollArea with a standard div so the page flows naturally */}
                     <div className="px-10 py-8 space-y-10">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                              <ClipboardList size={14} /> JOB CONTEXT
                           </h4>
                           <p className="text-sm font-medium leading-relaxed text-muted-foreground indent-8">
                              {selectedJob.description || selectedJob.match_reason}
                           </p>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                              <Banknote size={14} /> COMPENSATION INDEX
                           </h4>
                           <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-2xl flex items-center justify-between">
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Base Compensation Range</p>
                                 <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{selectedJob.salary || "DISCLOSED ON PROBE"}</p>
                              </div>
                              <div className="text-right space-y-1">
                                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Market Alignment</p>
                                 <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                       {[1, 2, 3, 4, 5].map(i => (
                                          <div key={i} className={`h-1.5 w-4 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-primary/20'}`} />
                                       ))}
                                    </div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">TOP 10%</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                              <ExternalLink size={14} /> TACTICAL STACK
                           </h4>
                           <div className="flex flex-wrap gap-3">
                              {(() => {
                                 try {
                                    const tags = JSON.parse(selectedJob.tech_stack || "[]");
                                    return tags.map((tag: string) => (
                                       <Badge key={tag} className="bg-muted/40 text-foreground border-2 border-border/60 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg hover:border-primary/40 transition-all cursor-default">
                                          {tag}
                                       </Badge>
                                    ));
                                 } catch {
                                    return <p className="text-[8px] font-black text-muted-foreground uppercase">Inventory Unspecified</p>;
                                 }
                              })()}
                           </div>
                        </div>

                        {/* Action Matrix - Tactical Buffer for taskbar/mobile UI security */}
                        <div className="pt-8 border-t border-border/20 grid grid-cols-2 gap-6 pb-32 mb-10">
                           <Button 
                              onClick={(e) => {
                                 e.stopPropagation(); 
                                 const url = selectedJob.url;
                                 console.log("TACTICAL_LINK_DISPATCH:", url);
                                 console.log("ELECTRON_CONTEXT_DETECTED:", !!(window as any).electron);
                                 
                                 if (!url) {
                                    toast.error("PROTOCOL BREACH", { description: "Mission URL is missing or corrupted." });
                                    return;
                                 }

                                 if (typeof window !== 'undefined' && (window as any).electron) {
                                    (window as any).electron.invoke('open-external-browser', url);
                                 } else {
                                    const win = window.open(url, '_blank', 'noopener,noreferrer');
                                    if (!win) {
                                       toast.error("BROWSER_LOCKDOWN", { description: "External navigation blocked by security protocol. Check browser settings." });
                                    }
                                 }

                                 // Synchronize Mission Status
                                 if ((selectedJob.status || "").toLowerCase() === 'new') {
                                    dispatch(updateJobStatus({ jobId: selectedJob.id, status: 'applied' }));
                                    // Status update is optimistic and cached in Redux
                                 }
                              }}
                              className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all"
                           >
                              INITIATE APPLICATION <ChevronRight size={16} />
                           </Button>
                           <div className="grid grid-cols-2 gap-4">
                              <Button
                                 onClick={handleDraftCL}
                                 variant="outline"
                                 className="h-14 border-2 border-border font-black uppercase tracking-widest text-[9px] rounded-2xl flex flex-col items-center justify-center gap-1 group/cl relative overflow-hidden"
                              >
                                 <FileText size={16} className="group-hover/cl:scale-110 transition-transform" />
                                 DRAFT CL
                                 {isDraftingCL && (
                                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-md flex items-center justify-center">
                                       <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                 )}
                              </Button>
                              <Button
                                 onClick={() => toast.error("ACCESS DENIED", {
                                    description: "Position removal sequence failed. User permissions insufficient."
                                 })}
                                 variant="outline"
                                 className="h-14 border-2 border-border font-black uppercase tracking-widest text-[9px] rounded-2xl hover:border-red-500/40 hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1"
                              >
                                 <Trash2 size={16} /> DISCARD
                              </Button>
                           </div>
                        </div>
                     </div>

                     <DraftCLOverlay
                        generatedCL={generatedCL}
                        setGeneratedCL={setGeneratedCL}
                     />
                  </Card>
               </motion.div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-6 bg-card/10 border-2 border-dashed border-border/20 rounded-[3rem] backdrop-blur-sm p-8">
                  <div className="relative">
                     <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                     <div className="relative h-24 w-24 rounded-3xl bg-card border-2 border-border/40 flex items-center justify-center text-muted-foreground/30 shadow-2xl">
                        <Briefcase size={48} className="animate-pulse" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[12px] font-black text-foreground uppercase tracking-[0.4em]">Awaiting Selection</p>
                     <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest max-w-[200px] leading-relaxed mx-auto">
                        Select a professional position from the vault to view detailed specifications
                     </p>
                  </div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}