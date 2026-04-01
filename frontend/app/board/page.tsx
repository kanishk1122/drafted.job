"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BoardColumn from "@/components/board/BoardColumn";
import { savedJobs as initialJobs } from "@/components/vault/mockData";
import { Job } from "@/components/vault/types";
import { LayoutGrid, Share2, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   DndContext,
   DragOverlay,
   closestCorners,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragStartEvent,
   DragOverEvent,
   DragEndEvent,
} from "@dnd-kit/core";
import {
   arrayMove,
   sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import BoardCard from "@/components/board/BoardCard";
import { toast } from "sonner";

const columns = [
   { id: "Drafted", title: "DRAFTED", color: "bg-blue-500" },
   { id: "Applied", title: "APPLIED", color: "bg-yellow-500" },
   { id: "Interview", title: "INTERVIEWS", color: "bg-purple-500" },
   { id: "Offer", title: "OFFERS", color: "bg-green-500" },
   { id: "Rejected", title: "REJECTED", color: "bg-red-500" }
];

export default function BoardPage() {
   const [jobs, setJobs] = useState<Job[]>(initialJobs);
   const [activeId, setActiveId] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState("");
   const [showSearch, setShowSearch] = useState(false);

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 8,
         },
      }),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   const findColumn = (id: string | number) => {
      if (typeof id === 'string') return id;
      const job = jobs.find(j => j.id === id);
      return job ? job.status : null;
   };

   const handleShareStatus = () => {
      const summary = jobs.map(j => `${j.title} @ ${j.company} [${j.status}]`).join('\n');
      navigator.clipboard.writeText(`PIPELINE STATUS REPORT:\n${summary}`);
      toast.success("PIPELINE STATUS COPIED", {
         description: "Current pipeline metrics secured to clipboard.",
      });
   };

   const handleSettings = () => {
      toast.info("PIPELINE SETTINGS", {
         description: "Opening configuration interface...",
      });
   };

   const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id as number);
   };

   const handleDragOver = (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as number;
      const overId = over.id;

      const activeColumn = findColumn(activeId);
      const overColumn = findColumn(overId);

      if (!activeColumn || !overColumn || activeColumn === overColumn) return;

      setJobs((prev) => {
         const activeIndex = prev.findIndex(i => i.id === activeId);
         const newJobs = [...prev];
         newJobs[activeIndex] = { ...newJobs[activeIndex], status: overColumn };
         return newJobs;
      });
   };

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      if (active.id !== over.id) {
         setJobs((prev) => {
            const oldIndex = prev.findIndex(i => i.id === active.id);
            const newIndex = prev.findIndex(i => i.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
         });
      }
      setActiveId(null);
   };

   const filteredJobs = useMemo(() => jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
   ), [jobs, searchQuery]);

   // PERFORMANCE FIX: Single-pass mapping
   const jobsByStatus = useMemo(() => {
      const acc: Record<string, Job[]> = columns.reduce((map, col) => {
         map[col.id] = [];
         return map;
      }, {} as Record<string, Job[]>);

      filteredJobs.forEach(job => {
         const matchingCol = columns.find(c => job.status.toLowerCase().includes(c.id.toLowerCase()));
         if (matchingCol && acc[matchingCol.id]) {
            acc[matchingCol.id].push(job);
         }
      });

      return acc;
   }, [filteredJobs]);

   const activeJob = activeId ? jobs.find(j => j.id === activeId) : null;

   return (
      <DashboardLayout>
         <div className="h-full flex flex-col space-y-8 overflow-hidden font-sans">
            {/* Board Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
               <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-foreground flex items-center gap-4">
                     Career Pipeline <LayoutGrid className="text-primary h-8 w-8 sm:h-12 sm:w-12" />
                  </h1>
                  <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Professional Recruitment Tracking & Management</p>
               </div>

               <div className="flex items-center gap-3">
                  {showSearch && (
                     <input 
                        className="bg-card/40 border-2 border-border/40 rounded-xl px-4 h-12 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none focus:border-primary/40 animate-in fade-in slide-in-from-right-4"
                        placeholder="SEARCH POSITIONS..."
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  )}
                  <Button 
                     onClick={handleShareStatus}
                     variant="outline" 
                     className="h-12 border-2 border-border/40 font-black text-[10px] uppercase tracking-widest rounded-xl hover:border-primary/40 flex items-center gap-2"
                  >
                     <Share2 size={16} /> <span className="hidden sm:inline">SHARE STATUS</span>
                  </Button>
                  <Button 
                     onClick={() => setShowSearch(!showSearch)}
                     variant="outline" 
                     className={`h-12 w-12 p-0 border-2 rounded-xl transition-all ${showSearch ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border/40'}`}
                  >
                     <Filter size={18} />
                  </Button>
                  <Button 
                     onClick={handleSettings}
                     variant="outline" 
                     className="h-12 w-12 p-0 border-2 border-border/40 rounded-xl hover:border-primary/40 flex items-center justify-center"
                  >
                     <Settings size={18} />
                  </Button>
               </div>
            </div>

            {/* Pipeline Workspace */}
            <DndContext
               sensors={sensors}
               collisionDetection={closestCorners}
               onDragStart={handleDragStart}
               onDragOver={handleDragOver}
               onDragEnd={handleDragEnd}
               autoScroll
            >
               <div className="flex-1 min-h-0 relative group/board">
                  <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/board:opacity-100 transition-opacity" />
                  <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/board:opacity-100 transition-opacity" />
                  
                  <div className="h-full overflow-x-auto no-scrollbar pb-8 pt-4">
                     <div className="flex gap-8 h-full px-8 min-w-max">
                        {columns.map((col) => (
                           <BoardColumn
                              key={col.id}
                              id={col.id}
                              title={col.title}
                              color={col.color}
                              jobs={jobsByStatus[col.id] || []}
                           />
                        ))}
                     </div>
                  </div>
               </div>

               <DragOverlay>
                  {activeJob ? (
                     <div className="opacity-80 scale-105 rotate-2 transition-transform cursor-grabbing">
                        <BoardCard job={activeJob} />
                     </div>
                  ) : null}
               </DragOverlay>
            </DndContext>
         </div>
      </DashboardLayout>
   );
}