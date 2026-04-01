"use client";

import React from "react";
import { Search, MapPin, Clock, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Job } from "./types";

interface JobIntelListProps {
   filteredJobs: Job[];
   selectedJob: Job | null;
   setSelectedJob: (job: Job) => void;
}

export default function JobIntelList({
   filteredJobs,
   selectedJob,
   setSelectedJob
}: JobIntelListProps) {
   return (
      <div className="w-full lg:w-[450px] flex flex-col min-h-0 relative">
         {/* Optical Depth Gradients */}
         <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
         <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent z-20 pointer-events-none" />

         <ScrollArea className="flex-1 no-scrollbar">
            <div className="space-y-4 pb-24 pt-4 px-3">
               <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                     filteredJobs.map((job) => (
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
                           className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-colors duration-300 overflow-hidden ${selectedJob?.id === job.id
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
                              <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest border-2 ${job.status === 'Applied' ? 'border-blue-500/40 text-blue-500 bg-blue-500/5' :
                                 job.status === 'Interview' ? 'border-green-500/40 text-green-500 bg-green-500/5' :
                                    'border-primary/40 text-primary bg-primary/5'
                                 }`}>
                                 {job.status}
                              </Badge>
                           </div>

                           <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest relative z-10">
                              <div className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</div>
                              <div className="flex items-center gap-1.5"><Clock size={12} /> {job.date}</div>
                              <div className="flex items-center gap-1.5 text-primary/80"><Banknote size={12} /> {job.salary}</div>
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
                     ))
                  ) : (
                     <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-muted/20 border-2 border-dashed border-border/40 rounded-3xl"
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
