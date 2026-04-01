"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VaultHeader from "@/components/vault/VaultHeader";
import CommandControls from "@/components/vault/CommandControls";
import JobIntelList from "@/components/vault/JobIntelList";
import MissionDetailedReadout from "@/components/vault/MissionDetailedReadout";
import { savedJobs } from "@/components/vault/mockData";
import { Job } from "@/components/vault/types";

export default function VaultPage() {
   const [selectedJob, setSelectedJob] = React.useState<Job>(savedJobs[0]);
   const [selectedPlatform, setSelectedPlatform] = React.useState<string>("ALL");
   const [searchQuery, setSearchQuery] = React.useState("");
   const [showFilters, setShowFilters] = React.useState(true);
   const [isDraftingCL, setIsDraftingCL] = React.useState(false);
   const [generatedCL, setGeneratedCL] = React.useState<string | null>(null);

   const handleDraftCL = () => {
      setIsDraftingCL(true);
      setGeneratedCL(null);
      // Simulate tactical drafting delay
      setTimeout(() => {
         setGeneratedCL(`[ENCRYPTED MISSION DOCUMENT: COVER LETTER]
---------------------------------------------------------
TARGET: Hiring Committee at ${selectedJob?.company}
MISSION: Securing ${selectedJob?.title} Deployment

Respected Intelligence Officers,

Based on the tactical parameters and required tech stack (${selectedJob?.techStack?.join(", ")}), 
I am submitting my operational credentials for the ${selectedJob?.title} role.

My current fit score of ${selectedJob?.fitScore}% indicates high alignment with your 
strategic objectives. I am prepared to initiate deployment immediately.

Awaiting manual approval of this node.
---------------------------------------------------------`);
         setIsDraftingCL(false);
      }, 2500);
   };

   const filteredJobs = savedJobs.filter(job => {
      const matchesPlatform = selectedPlatform === "ALL" || job.platform.toUpperCase() === selectedPlatform;
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
   });

   const platforms = ["ALL", "LINKEDIN", "NAUKRI", "INDEED"];

   return (
      <DashboardLayout>
         <div className="h-full flex flex-col space-y-8 overflow-hidden">
            <VaultHeader />

            <CommandControls 
               platforms={platforms}
               selectedPlatform={selectedPlatform}
               setSelectedPlatform={setSelectedPlatform}
               showFilters={showFilters}
               setShowFilters={setShowFilters}
               searchQuery={searchQuery}
               setSearchQuery={setSearchQuery}
            />

            <div className="flex-1 min-h-0 flex gap-8">
               <JobIntelList 
                  filteredJobs={filteredJobs}
                  selectedJob={selectedJob}
                  setSelectedJob={setSelectedJob}
               />

               <MissionDetailedReadout 
                  selectedJob={selectedJob}
                  handleDraftCL={handleDraftCL}
                  isDraftingCL={isDraftingCL}
                  generatedCL={generatedCL}
                  setGeneratedCL={setGeneratedCL}
               />
            </div>
         </div>
      </DashboardLayout>
   );
}
