import React, { memo } from "react";
import { motion } from "framer-motion";
import { JobSummary } from "@/lib/services/job-service";
import { MapPin, ExternalLink, ChevronRight } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/redux/store";
import { updateJobStatus, fetchJobMetrics } from "@/lib/redux/slices/jobSlice";

import { useRouter } from "next/navigation";

interface BoardCardProps {
   job: JobSummary;
   index: number;
}

const BoardCard = memo(({ job, index }: BoardCardProps) => {
   const dispatch = useAppDispatch();
   const router = useRouter();

   return (
      <Draggable draggableId={job.id.toString()} index={index}>
         {(provided, snapshot) => (
            <div
               ref={provided.innerRef}
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               style={{
                  ...provided.draggableProps.style,
                  opacity: snapshot.isDragging ? 0.9 : 1,
               }}
               className="mb-4"
            >
               <motion.div
                  onClick={() => router.push(`/vault?jobId=${job.id}`)}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`group relative p-4 bg-card/40 border-2 rounded-2xl transition-all duration-400 shadow-xl cursor-pointer ${
                     snapshot.isDragging 
                        ? "border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]" 
                        : "border-border/40 hover:border-primary/40 hover:bg-primary/5"
                  }`}
               >
                  <div className="space-y-3 select-none">
                     <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${job.status === 'offer' ? 'bg-green-500' : 'bg-primary'} animate-pulse`} />
                              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/90">{job.title}</p>
                           </div>
                           <Badge 
                              variant="outline" 
                              className="bg-muted text-muted-foreground border-border/20 font-black text-[7px] uppercase tracking-tighter px-1.5 h-4 opacity-40 group-hover:opacity-100 transition-opacity"
                           >
                              {job.status.toUpperCase()}
                           </Badge>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{job.company}</p>
                        </div>
                        <div className="h-6 w-6 rounded-lg bg-muted/20 flex items-center justify-center p-1.5 grayscale opacity-60">
                           <img src={`https://www.google.com/s2/favicons?domain=${job.platform.toLowerCase()}.com&sz=128`} alt={job.platform} className="w-full h-full object-contain" />
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                           <MapPin size={10} className="shrink-0" />
                           <span className="text-[9px] font-semibold uppercase tracking-wider truncate">
                              {job.location && job.location.length > 30 ? job.location.slice(0,30) + "..." : job.location || job.platform?.toUpperCase()}
                           </span>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                           <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter">MATCH</span>
                           <p className="text-[11px] font-black text-primary tabular-nums tracking-tighter leading-none">{job.heuristic_score}%</p>
                        </div>
                     </div>
                  </div>

                  {/* Strategic Action Layer */}
                  {job.url && (
                     <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 rounded-2xl z-10">
                        <Button 
                           onClick={(e) => {
                              e.stopPropagation(); 
                              const url = job.url;
                              if (typeof window !== 'undefined' && (window as any).electron) {
                                 (window as any).electron.invoke('open-external-browser', url);
                              } else {
                                 window.open(url, '_blank', 'noopener,noreferrer');
                              }

                              // Synchronize Mission Status
                              if ((job.status || "").toLowerCase() === 'new') {
                                 dispatch(updateJobStatus({ jobId: job.id, status: 'applied' }));
                              }
                           }}
                           className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all"
                        >
                           INITIATE APPLICATION <ChevronRight size={16} />
                        </Button>
                     </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary transition-all opacity-0 group-hover:opacity-100" />
               </motion.div>
            </div>
         )}
      </Draggable>
   );
});

BoardCard.displayName = "BoardCard";
export default BoardCard;
