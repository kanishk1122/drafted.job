"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Job, JobSummary } from "@/lib/services/job-service";

interface JobIntelListProps {
   filteredJobs: JobSummary[];
   selectedJob: Job | null;  // Full job for highlight comparison by id
   setSelectedJob: (job: JobSummary) => void;
   loadMore: () => void;
   hasMore: boolean;
   loading: boolean;
}

export default function JobIntelList({
   filteredJobs,
   selectedJob,
   setSelectedJob,
   loadMore,
   hasMore,
   loading
}: JobIntelListProps) {
   const observer = React.useRef<IntersectionObserver | null>(null);
   
   const lastElementRef = React.useCallback(
      (node: HTMLDivElement) => {
         if (loading) return;
         if (observer.current) observer.current.disconnect();
         observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
               loadMore();
            }
         });
         if (node) observer.current.observe(node);
      },
      [loading, hasMore, loadMore]
   );

   return (
      <div className="w-full lg:w-[450px] flex flex-col min-h-0 relative h-[80vh]">
         {/* Optical Depth Gradients */}
         <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
         <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent z-20 pointer-events-none" />

         {/* 1. MOVED ScrollArea OUTSIDE to act as the true boundary */}
         <ScrollArea className="flex-1 min-h-0 w-full relative z-10 overflow-y-auto no-scrollbar">
            {/* 2. Swapped space-y-4 to flex/gap for smoother AnimatePresence exits */}
            <div className="flex flex-col gap-4 pb-24 pt-4 px-3 sm:px-6 min-h-full">
               
               {/* 3. AnimatePresence only wraps the mapped items */}
               <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                     <>
                        {filteredJobs.map((job) => (
                           <motion.div
                              key={job.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95, x: -20, filter: "blur(10px)" }}
                              animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)", transition: { duration: 0.2 } }}
                              transition={{
                                 layout: { type: "spring", bounce: 0.2, duration: 0.6 },
                                 opacity: { duration: 0.3 },
                                 filter: { duration: 0.3 }
                              }}
                              whileHover={{ scale: 1.02, x: 5, transition: { duration: 0.2 } }}
                              onClick={() => setSelectedJob(job)}
                              className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-colors duration-300 overflow-hidden shrink-0 ${
                                 selectedJob?.id === job.id
                                    ? 'bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]'
                                    : 'bg-card/40 border-border/40 hover:bg-muted/40 hover:border-border'
                              }`}
                           >
                              {/* Subtle Entry/Hover Gradient Sweep */}
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                              <div className="flex justify-between items-start mb-4 relative z-10">
                                 <div className="space-y-1">
                                    <h3 className={`text-[12px] font-black uppercase tracking-widest transition-colors ${selectedJob?.id === job.id ? 'text-primary' : 'text-foreground'}`}>
                                       {job.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.company}</p>
                                 </div>
                                 <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest border-2 ${
                                    job.status === 'Applied' ? 'border-blue-500/40 text-blue-500 bg-blue-500/5' :
                                    job.status === 'Interview' ? 'border-green-500/40 text-green-500 bg-green-500/5' :
                                    'border-primary/40 text-primary bg-primary/5'
                                 }`}>
                                    {job.status}
                                 </Badge>
                              </div>

                              <div className="flex items-center gap-3 text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest relative z-10">
                                 {/* Platform favicon */}
                                 <div className="flex items-center gap-1.5 shrink-0">
                                    <img src={`https://www.google.com/s2/favicons?domain=${job.platform?.toLowerCase()}.com&sz=32`} alt={job.platform} className="h-3 w-3 grayscale opacity-60" />
                                    <span>{job.platform?.toUpperCase()}</span>
                                 </div>
                                 
                                 {/* Location Index */}
                                 {job.location && (
                                    <div className="flex items-center gap-1 border-l border-border/40 pl-3">
                                       <Search size={10} className="text-primary/40" />
                                       <span className="truncate max-w-[120px]">{job.location}</span>
                                    </div>
                                 )}

                                 {/* Salary if present */}
                                 {job.salary && job.salary !== 'Not specified' && (
                                    <span className="text-green-500/70">{job.salary}</span>
                                 )}
                                 {/* Match score */}
                                 <span className="ml-auto text-primary/80 font-black shrink-0">MATCH: {job.heuristic_score}%</span>
                              </div>

                              {/* Selection Rim Light */}
                              {selectedJob?.id === job.id && (
                                 <motion.div
                                    layoutId="active-job-rim"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    className="absolute inset-x-8 bottom-0 h-[2px] bg-primary blur-[1px] shadow-[0_0_15px_rgba(var(--primary-rgb),1)] rounded-full z-20"
                                 />
                              )}
                           </motion.div>
                        ))}

                        {hasMore && (
                           /* 4. ATTACHED ref={lastElementRef} so infinite scroll observer fires! */
                           <motion.div 
                              layout 
                              ref={lastElementRef} 
                              className="pt-4 pb-8 flex flex-col items-center gap-3 shrink-0"
                           >
                              <Button
                                 onClick={loadMore}
                                 disabled={loading}
                                 variant="outline"
                                 className="w-full max-w-[200px] border-primary/20 hover:border-primary/60 hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest"
                              >
                                 {loading ? (
                                    <>
                                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> LOADING DATA...
                                    </>
                                 ) : "LOAD MORE MISSIONS"}
                              </Button>
                              <p className="text-[7px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">End of Mission Sector Alpha</p>
                           </motion.div>
                        )}

                        {!hasMore && filteredJobs.length > 0 && (
                           <motion.div layout className="text-center p-8 border-t border-border/20 shrink-0">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">End of Mission Records</p>
                           </motion.div>
                        )}
                     </>
                  ) : (
                     <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-muted/20 border-2 border-dashed border-border/40 rounded-3xl shrink-0 my-auto"
                     >
                        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/40">
                           <Search size={24} />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">No Positions Found</p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </ScrollArea>
      </div>
   );
}