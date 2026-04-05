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
import { updateJobStatus, fetchJobMetrics, deleteJob } from "@/lib/redux/slices/jobSlice";

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
      <div className="hidden lg:flex flex-1 flex-col relative h-full w-full">
         <AnimatePresence mode="wait">
            {selectedJob ? (
               <motion.div
                  key={selectedJob.id}
                  initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(5px)", transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full flex flex-col"
               >
                  <Card className="h-full w-full bg-card/30 border-border/20 backdrop-blur-xl rounded-l-2xl overflow-hidden flex flex-col relative shadow-xl no-scrollbar">
                     <div className="flex-1 overflow-y-auto no-scrollbar">
                        {/* Compact Visual Header */}
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative p-6 sm:p-8 flex items-end border-b border-border/10">
                           <div className="space-y-4 z-10 w-full">
                              <div className="flex items-center justify-between w-full">
                                 <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                       <Badge variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/5 font-black uppercase tracking-widest h-5 px-1.5">
                                          ID:{selectedJob.id.toString().padStart(3, '0')}
                                       </Badge>
                                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 flex items-center gap-1 shrink-0">
                                          via <img src={`https://www.google.com/s2/favicons?domain=${selectedJob.platform.toLowerCase()}.com&sz=64`} className="h-3 w-3 grayscale opacity-60" alt="" /> {selectedJob.platform.toUpperCase()}
                                       </span>
                                       {selectedJob.location && (
                                          <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 border-l border-border/10 pl-3">
                                             <Briefcase size={10} className="opacity-40" /> {selectedJob.location}
                                          </span>
                                       )}
                                       <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="ml-1 hover:text-primary transition-colors text-muted-foreground/40">
                                          <ExternalLink size={11} />
                                       </a>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground leading-none">{selectedJob.title}</h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-80">{selectedJob.company}</p>
                                 </div>
                                 <div className="flex flex-col items-center gap-1 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                    <span className="text-[7px] font-black text-primary/60 uppercase tracking-[0.2em] leading-none">FIT SCORE</span>
                                    <span className="text-2xl font-black text-primary tabular-nums tracking-tighter leading-none">{selectedJob.heuristic_score}%</span>
                                 </div>
                              </div>
                           </div>
                           {/* Subtle Background Texture */}
                           <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                              <Briefcase size={80} />
                           </div>
                        </div>

                        {/* Content Area: Independent Scroll Context */}
                        <div className="px-6 sm:px-8 py-6 space-y-8">
                           <div className="space-y-3">
                              <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                 <ClipboardList size={12} /> MISSION CONTEXT
                              </h4>
                              <p className="text-[12px] font-medium leading-relaxed text-muted-foreground/80 indent-6">
                                 {selectedJob.description || selectedJob.match_reason}
                              </p>
                           </div>

                           <div className="space-y-3">
                              <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                 <Banknote size={12} /> COMPENSATION SCALAR
                              </h4>
                              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                                 <div className="space-y-1">
                                    <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Base Estimate</p>
                                    <p className="text-base font-black text-foreground tabular-nums tracking-tighter">{selectedJob.salary || "UNDISCLOSED"}</p>
                                 </div>
                                 <div className="text-right space-y-1">
                                    <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Market Status</p>
                                    <div className="flex items-center gap-2">
                                       <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map(i => (
                                             <div key={i} className={`h-1 w-3 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-primary/10'}`} />
                                          ))}
                                       </div>
                                       <span className="text-[9px] font-black text-primary/80 uppercase tracking-tighter shrink-0">OPTIMAL</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                 <ExternalLink size={12} /> TECHNICAL SPECTRUM
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 {(() => {
                                    try {
                                       const tags = JSON.parse(selectedJob.tech_stack || "[]");
                                       if (tags.length === 0) throw new Error();
                                       return tags.map((tag: string) => (
                                          <Badge key={tag} className="bg-muted/30 text-foreground border border-border/40 font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-md hover:border-primary/20 transition-all cursor-default">
                                             {tag}
                                          </Badge>
                                       ));
                                    } catch {
                                       return <p className="text-[7px] font-black text-muted-foreground uppercase opacity-40">System Inventory Unspecified</p>;
                                    }
                                 })()}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Fixed Action Matrix: Stays at bottom of card */}
                     <div className="px-6 sm:px-8 py-4 bg-muted/10 border-t border-border/10 grid grid-cols-12 gap-3 shrink-0">
                        <Button
                           onClick={(e) => {
                              e.stopPropagation();
                              const url = selectedJob.url;
                              if (!url) { toast.error("MISSION URL CORRUPTED"); return; }

                              if (typeof window !== 'undefined' && (window as any).electron) {
                                 (window as any).electron.invoke('open-external-browser', url);
                              } else {
                                 window.open(url, '_blank', 'noopener,noreferrer');
                              }

                              if ((selectedJob.status || "").toLowerCase() === 'new') {
                                 dispatch(updateJobStatus({ jobId: selectedJob.id, status: 'applied' }));
                              }
                           }}
                           className="col-span-8 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[9px] rounded-lg shadow-lg shadow-primary/10 flex items-center justify-center gap-2 transition-all"
                        >
                           DEPLOY APPLICATION <ChevronRight size={14} />
                        </Button>
                        
                        <Button
                           onClick={handleDraftCL}
                           variant="outline"
                           className="col-span-2 h-10 border border-border/40 font-black uppercase tracking-widest text-[8px] rounded-lg flex flex-col items-center justify-center gap-0.5 group/cl relative"
                        >
                           <FileText size={12} className="group-hover/cl:scale-110 transition-transform" />
                           DRAFT
                           {isDraftingCL && (
                              <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center rounded-lg">
                                 <Loader2 className="animate-spin text-primary" size={14} />
                              </div>
                           )}
                        </Button>

                        <Button
                           onClick={() => {
                              if (!selectedJob?.id) return;
                              dispatch(deleteJob(selectedJob.id))
                                 .then(() => {
                                    toast.success("MISSION PURGED");
                                    dispatch(fetchJobMetrics());
                                 });
                           }}
                           variant="outline"
                           className="col-span-2 h-10 border border-border/40 font-black uppercase tracking-widest text-[8px] rounded-lg hover:border-red-500/20 hover:text-red-500 transition-all flex flex-col items-center justify-center gap-0.5"
                        >
                           <Trash2 size={12} />
                           DISCARD
                        </Button>
                     </div>

                     <DraftCLOverlay
                        generatedCL={generatedCL}
                        setGeneratedCL={setGeneratedCL}
                     />
                  </Card>
               </motion.div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 border border-dashed border-border/10 rounded-2xl backdrop-blur-sm p-6">
                  <div className="relative h-16 w-16 rounded-2xl bg-card border border-border/20 flex items-center justify-center text-muted-foreground/20">
                     <Briefcase size={32} className="animate-pulse" />
                  </div>
                  <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] max-w-[150px]">Select a Mission Record to view Intel</p>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}