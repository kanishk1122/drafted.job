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
      <div className="w-full flex-1 flex flex-col min-h-0 relative h-full">
         {/* Optical Depth Gradients */}
         <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-background/20 to-transparent z-20 pointer-events-none" />
         <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background/40 via-background/20 to-transparent z-20 pointer-events-none" />

         <ScrollArea className="flex-1 w-full relative z-10 no-scrollbar">
            <div className="flex flex-col gap-3 pb-20 pt-2 px-3 sm:px-4 min-h-full">
               
               <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                     <>
                        {filteredJobs.map((job) => (
                           <motion.div
                              key={job.id}
                              layout
                              initial={{ opacity: 0, scale: 0.98, x: -10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                              transition={{
                                 layout: { type: "spring", bounce: 0.2, duration: 0.4 },
                                 opacity: { duration: 0.2 }
                              }}
                              whileHover={{ scale: 1.01, x: 2, transition: { duration: 0.1 } }}
                              onClick={() => setSelectedJob(job)}
                              className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden shrink-0 ${
                                 selectedJob?.id === job.id
                                    ? 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]'
                                    : 'bg-card/30 border-border/20 hover:bg-muted/30 hover:border-border/40'
                              }`}
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                              <div className="flex justify-between items-start mb-3 relative z-10">
                                 <div className="space-y-0.5">
                                    <h3 className={`text-[11px] font-black uppercase tracking-wider transition-colors leading-tight ${selectedJob?.id === job.id ? 'text-primary' : 'text-foreground'}`}>
                                       {job.title}
                                    </h3>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-80">{job.company}</p>
                                 </div>
                                 <Badge variant="outline" className={`text-[7px] font-black uppercase tracking-widest border px-1.5 h-4 ${
                                    job.status === 'Applied' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' :
                                    job.status === 'Interview' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                    'border-primary/30 text-primary bg-primary/5'
                                 }`}>
                                    {job.status}
                                 </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest relative z-10">
                                 <div className="flex items-center gap-1 shrink-0">
                                    <img src={`https://www.google.com/s2/favicons?domain=${job.platform?.toLowerCase()}.com&sz=16`} alt={job.platform} className="h-2.5 w-2.5 grayscale opacity-50" />
                                    <span>{job.platform?.toUpperCase()}</span>
                                 </div>
                                 
                                 {job.location && (
                                    <div className="flex items-center gap-1 border-l border-border/20 pl-2">
                                       <span className="truncate max-w-[100px]">{job.location}</span>
                                    </div>
                                 )}

                                 <span className="ml-auto text-primary/70 font-black shrink-0">MATCH: {job.heuristic_score}%</span>
                              </div>

                              {selectedJob?.id === job.id && (
                                 <motion.div
                                    layoutId="active-job-rim"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    className="absolute inset-x-4 bottom-0 h-[2px] bg-primary blur-[1px] shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)] rounded-full z-20"
                                 />
                              )}
                           </motion.div>
                        ))}

                        {hasMore && (
                           <motion.div 
                              layout 
                              ref={lastElementRef} 
                              className="pt-2 pb-6 flex flex-col items-center gap-2 shrink-0"
                           >
                              <Button
                                 onClick={loadMore}
                                 disabled={loading}
                                 variant="outline"
                                 className="w-full max-w-[160px] border-primary/20 h-8 text-[9px] font-black uppercase tracking-widest"
                              >
                                 {loading ? "LOADING..." : "LOAD MORE"}
                              </Button>
                           </motion.div>
                        )}
                     </>
                  ) : (
                     <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-muted/10 border border-dashed border-border/20 rounded-2xl shrink-0"
                     >
                        <Search size={20} className="text-muted-foreground/30" />
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">No Records Found</p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </ScrollArea>
      </div>
   );
}