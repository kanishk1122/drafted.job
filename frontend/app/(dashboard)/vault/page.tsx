"use client";

import React from "react";
import VaultHeader from "@/components/vault/VaultHeader";
import CommandControls from "@/components/vault/CommandControls";
import JobIntelList from "@/components/vault/JobIntelList";
import MissionDetailedReadout from "@/components/vault/MissionDetailedReadout";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/redux/store";
import { fetchJobs, incrementOffset, fetchJobDetail, setSelectedJobId, resetJobs } from "@/lib/redux/slices/jobSlice";
import { JobSummary } from "@/lib/services/job-service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useSearchParams } from "next/navigation";

export default function VaultPage() {
   const searchParams = useSearchParams();
   const dispatch = useAppDispatch();
   const { jobs, fullJobs, loading, detailLoading, hasMore, offset, selectedJobId } = useAppSelector((state: RootState) => state.job);
   const selectedJob = selectedJobId ? fullJobs[selectedJobId] : null;

   const [selectedPlatform, setSelectedPlatform] = React.useState<string>("ALL");
   const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
   const [searchQuery, setSearchQuery] = React.useState("");
   const debouncedSearch = useDebounce(searchQuery, 300);
   const [showFilters, setShowFilters] = React.useState(true);
   const [isDraftingCL, setIsDraftingCL] = React.useState(false);
   const [generatedCL, setGeneratedCL] = React.useState<string | null>(null);

   const handleSelectJob = React.useCallback((summary: JobSummary) => {
      dispatch(setSelectedJobId(summary.id));
      dispatch(fetchJobDetail(summary.id));
   }, [dispatch]);

   const loadMore = React.useCallback(() => {
     if (!loading && hasMore) {
       dispatch(incrementOffset(20));
       dispatch(fetchJobs({ 
         platform: selectedPlatform, 
         status: selectedStatus === "ALL" ? undefined : selectedStatus.toLowerCase(),
         limit: 20, 
         offset: offset + 20,
         sort_by: "newest"
       }));
     }
   }, [dispatch, loading, hasMore, selectedPlatform, selectedStatus, offset]);

   // HANDLE DEEP LINKING: Select job from URL if present
   React.useEffect(() => {
      const urlJobId = searchParams.get("jobId");
      if (urlJobId) {
         const id = parseInt(urlJobId);
         if (!isNaN(id)) {
            dispatch(setSelectedJobId(id));
            dispatch(fetchJobDetail(id));
         }
      }
   }, [searchParams, dispatch]);

   React.useEffect(() => {
     dispatch(fetchJobs({ 
       platform: selectedPlatform, 
       status: selectedStatus === "ALL" ? undefined : selectedStatus.toLowerCase(),
       limit: 20, 
       offset: 0,
       sort_by: "newest"
     }));
   }, [dispatch, selectedPlatform, selectedStatus]);

   const handleDraftCL = () => {
      setIsDraftingCL(true);
      setTimeout(() => {
         setGeneratedCL("SUBJECT: TACTICAL ARCHITECT POSITION INQUIRY\n\nI am initiating the application sequence for the role. My technical arsenal is surgical, my commitment is absolute. System deployment imminent.");
         setIsDraftingCL(false);
      }, 2400);
   };

   const filteredJobs = jobs.filter(job => 
     job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
     job.company.toLowerCase().includes(debouncedSearch.toLowerCase())
   );

   const platforms = ["ALL", "LINKEDIN", "NAUKRI", "INDEED"];
   const statuses = ["ALL", "NEW", "APPLIED", "INTERVIEW", "REJECTED"];

   return (
      <div className="flex flex-col h-[calc(100vh-120px)] bg-card/10 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-2xl relative">
         {/* Header Section: Compact Industrial Padding */}
         <div className="p-3 sm:p-4 space-y-2 shrink-0 border-b border-border/10">
            <VaultHeader />

            <CommandControls 
               platforms={platforms}
               selectedPlatform={selectedPlatform}
               setSelectedPlatform={setSelectedPlatform}
               statuses={statuses}
               selectedStatus={selectedStatus}
               setSelectedStatus={setSelectedStatus}
               showFilters={showFilters}
               setShowFilters={setShowFilters}
               searchQuery={searchQuery}
               setSearchQuery={setSearchQuery}
            />
         </div>

         {/* Main Workspace: Side-by-Side Locked Viewport */}
         <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative border-t border-border/10 overflow-hidden">
            
            {/* Left Column: Job List (Independent Scroll) */}
            <div className={cn(
               "w-full lg:w-[380px] xl:w-[420px] border-r border-border/10 flex flex-col min-h-0 bg-background/20",
               selectedJob && "hidden lg:flex"
            )}>
               <JobIntelList 
                  filteredJobs={filteredJobs} 
                  selectedJob={selectedJob} 
                  setSelectedJob={handleSelectJob} 
                  loadMore={loadMore}
                  hasMore={hasMore}
                  loading={loading}
               />
            </div>

            {/* Right Column: Mission Readout (Independent Scroll) */}
            <div className={cn(
               "flex-1 flex flex-col min-h-0 bg-background/5",
               !selectedJob && "hidden lg:flex"
            )}>
               {selectedJob && (
                  <div className="lg:hidden p-3 border-b border-border/10 flex items-center justify-between bg-card/60 backdrop-blur-xl shrink-0">
                      <Button 
                         variant="ghost" 
                         onClick={() => dispatch(setSelectedJobId(null))}
                         className="text-[9px] font-black uppercase tracking-widest gap-2 h-auto py-1.5"
                      >
                         <ChevronLeft size={14} /> BACK TO RECORDS
                      </Button>
                     <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/30 text-primary bg-primary/5">
                        ACTIVE READOUT
                     </Badge>
                  </div>
               )}
               
               {detailLoading && !selectedJob ? (
                   <div className="flex-1 flex items-center justify-center">
                      <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                   </div>
                ) : (
                   <MissionDetailedReadout 
                      selectedJob={selectedJob} 
                      handleDraftCL={handleDraftCL}
                      isDraftingCL={isDraftingCL}
                      generatedCL={generatedCL}
                      setGeneratedCL={setGeneratedCL}
                   />
                )}
            </div>
         </div>
      </div>
   );
}
