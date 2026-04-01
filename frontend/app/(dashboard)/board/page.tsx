"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import BoardColumn from "@/components/board/BoardColumn";
import { LayoutGrid, Share2, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, DropResult, DragUpdate } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchJobs, updateJobStatus } from "@/lib/redux/slices/jobSlice";

const columns = [
   { id: "new", title: "DRAFTED", color: "bg-blue-500" },
   { id: "applied", title: "APPLIED", color: "bg-yellow-500" },
   { id: "interview", title: "INTERVIEWS", color: "bg-purple-500" },
   { id: "offer", title: "OFFERS", color: "bg-green-500" },
   { id: "rejected", title: "REJECTED", color: "bg-red-500" }
];

export default function BoardPage() {
   const dispatch = useAppDispatch();
   const { jobs, loading } = useAppSelector((state) => state.job);
   const [searchQuery, setSearchQuery] = useState("");
   const [showSearch, setShowSearch] = useState(false);

   const scrollRef = useRef<HTMLDivElement>(null);
   const rafRef = useRef<number | null>(null);

   useEffect(() => {
      const track = (e: MouseEvent) => { (window as any).__dragX = e.clientX; };
      window.addEventListener("mousemove", track);
      return () => window.removeEventListener("mousemove", track);
   }, []);

   useEffect(() => {
      dispatch(fetchJobs({ limit: 1000 }));
   }, [dispatch]);

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

   const onDragUpdate = useCallback((update: DragUpdate) => {
      if (!update.destination) return;
      const container = scrollRef.current;
      if (!container) return;

      const EDGE_ZONE = 120;
      const SCROLL_SPEED = 12;

      const cancelScroll = () => {
         if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
         }
      };

      const autoScroll = () => {
         const rect = container.getBoundingClientRect();
         const x = (window as any).__dragX ?? 0;
         const distFromRight = rect.right - x;
         const distFromLeft = x - rect.left;

         if (distFromRight < EDGE_ZONE) {
            container.scrollLeft += SCROLL_SPEED;
            container.dispatchEvent(new Event('scroll'));
         } else if (distFromLeft < EDGE_ZONE) {
            container.scrollLeft -= SCROLL_SPEED;
            container.dispatchEvent(new Event('scroll'));
         }

         cancelScroll();
         rafRef.current = requestAnimationFrame(autoScroll);
      };
      
      autoScroll();
   }, []);

   const onDragEnd = (result: DropResult) => {
      if (rafRef.current) {
         cancelAnimationFrame(rafRef.current);
         rafRef.current = null;
      }

      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const activeId = parseInt(draggableId);
      const destStatus = destination.droppableId;

      dispatch(updateJobStatus({ jobId: activeId, status: destStatus }));
   };

   const filteredJobs = useMemo(() => jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
   ), [jobs, searchQuery]);

   const jobsByStatus = useMemo(() => {
      const acc: Record<string, any[]> = columns.reduce((map, col) => {
         map[col.id] = [];
         return map;
      }, {} as Record<string, any[]>);

      filteredJobs.forEach(job => {
         const matchingCol = columns.find(c => job.status?.toLowerCase().includes(c.id.toLowerCase()));
         if (matchingCol && acc[matchingCol.id]) {
            acc[matchingCol.id].push(job);
         }
      });

      return acc;
   }, [filteredJobs]);

   return (
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

         {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
         ) : (
            <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
               <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden pb-12 pt-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/10 select-none">
                  <div className="flex gap-10 h-full min-w-max px-10">
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
            </DragDropContext>
         )}
      </div>
   );
}