import React, { memo } from "react";
import { motion } from "framer-motion";
import { Job } from "@/components/vault/types";
import { MapPin, Clock } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";

interface BoardCardProps {
   job: Job;
}

const BoardCard = memo(({ job }: BoardCardProps) => {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
   } = useSortable({ id: job.id });

   const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      opacity: isDragging ? 0.3 : 1,
      zIndex: isDragging ? 1000 : 1,
   };

   return (
      <motion.div
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         whileHover={{ y: -5, scale: 1.02, zIndex: 30 }}
         className="group relative p-4 mb-4 bg-card/40 border-2 border-border/40 rounded-2xl cursor-grab active:cursor-grabbing hover:border-primary/40 hover:bg-primary/5 transition-all duration-400 shadow-xl"
      >
         <div className="space-y-3 pointer-events-none select-none">
            <div className="flex justify-between items-start">
               <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                     <div className={`h-1.5 w-1.5 rounded-full ${job.status === 'Offer' ? 'bg-green-500' : 'bg-primary'} animate-pulse`} />
                     <p className="text-[10px] font-black uppercase tracking-widest text-foreground/90">{job.title}</p>
                  </div>
                  <Badge 
                     variant="outline" 
                     className="bg-muted text-muted-foreground border-border/20 font-black text-[7px] uppercase tracking-tighter px-1.5 h-4 opacity-40 group-hover:opacity-100 transition-opacity"
                  >
                     {job.status}
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
                  <span className="text-[9px] font-semibold uppercase tracking-wider truncate">{job.location}</span>
               </div>
               <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <Clock size={10} className="shrink-0" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">{job.date}</span>
               </div>
               <div className="ml-auto flex flex-col items-end">
                  <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter">MATCH</span>
                  <p className="text-[11px] font-black text-primary tabular-nums tracking-tighter leading-none">{job.fitScore}%</p>
               </div>
            </div>
         </div>
         <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary transition-all opacity-0 group-hover:opacity-100" />
      </motion.div>
   );
});

BoardCard.displayName = "BoardCard";
export default BoardCard;
