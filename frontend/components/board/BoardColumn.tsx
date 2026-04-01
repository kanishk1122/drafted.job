import React, { memo } from "react";
import { Job } from "@/components/vault/types";
import BoardCard from "./BoardCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface BoardColumnProps {
   id: string;
   title: string;
   jobs: Job[];
   color: string;
}

const BoardColumn = memo(({ id, title, jobs, color }: BoardColumnProps) => {
   const { setNodeRef } = useDroppable({ id });

   return (
      <div ref={setNodeRef} className="w-[280px] sm:w-[320px] shrink-0 flex flex-col h-full rounded-3xl bg-card/15 border-2 border-border/10 relative group/column hover:border-border/30 transition-all duration-500 shadow-2xl">
         {/* Column Header */}
         <div className="p-6 border-b border-border/20 bg-muted/10 shrink-0">
            <div className="flex items-center justify-between gap-3">
               <div className="space-y-1">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground transition-colors group-hover/column:text-primary">
                     {title}
                  </h3>
                  <div className={`h-1 w-8 rounded-full ${color} opacity-60 shadow-[0_0_15px_${color}] group-hover/column:opacity-100 transition-opacity`} />
               </div>
               <Badge className="bg-muted text-muted-foreground border-2 border-border/20 font-black text-[9px] uppercase tracking-widest px-3 h-6">
                  {jobs.length} NODES
               </Badge>
            </div>
         </div>

         {/* Job Cards Area */}
         <ScrollArea className="flex-1 no-scrollbar h-full">
            <div className="space-y-4 pb-24 mt-2 px-6 py-4">
               <SortableContext id={id} items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                  {jobs.length > 0 ? (
                     jobs.map((job) => <BoardCard key={job.id} job={job} />)
                  ) : (
                     <div className="flex-1 h-[200px] border-2 border-dashed border-border/20 rounded-2xl flex items-center justify-center p-8 text-center bg-muted/5">
                        <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em]">No Intelligence Detected In This Sector</p>
                     </div>
                  )}
               </SortableContext>
            </div>
         </ScrollArea>

         {/* Bottom Aura Effect */}
         <div className={`absolute bottom-0 inset-x-0 h-2 bg-gradient-to-t ${color} opacity-5 group-hover/column:opacity-20 blur-xl transition-opacity pointer-events-none`} />
      </div>
   );
});

BoardColumn.displayName = "BoardColumn";
export default BoardColumn;
