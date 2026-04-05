"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

interface CommandControlsProps {
   platforms: string[];
   selectedPlatform: string;
   setSelectedPlatform: (platform: string) => void;
   statuses: string[];
   selectedStatus: string;
   setSelectedStatus: (status: string) => void;
   showFilters: boolean;
   setShowFilters: (show: boolean) => void;
   searchQuery: string;
   setSearchQuery: (query: string) => void;
}

export default function CommandControls({
   platforms,
   selectedPlatform,
   setSelectedPlatform,
   statuses,
   selectedStatus,
   setSelectedStatus,
   showFilters,
   setShowFilters,
   searchQuery,
   setSearchQuery
}: CommandControlsProps) {
   return (
      <div className="space-y-3 shrink-0">
         <div className="flex items-center gap-3 py-1 px-1">
            <div className="relative flex-1 group">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                  placeholder="SEARCH MISSIONS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-card/40 border-border border-2 font-black text-[9px] tracking-widest uppercase rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/60 focus-visible:ring-4 transition-all"
               />
            </div>
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-10 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${showFilters ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'border-border/60 hover:border-primary/40 text-muted-foreground'}`}
               >
                  <Filter size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Filters</span>
               </Button>
            </div>
         </div>

         {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 px-1 pt-2">
               {/* Platform Selector */}
               <div className="space-y-2.5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-60">Platform Pipeline</p>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                     <SelectTrigger className="w-full h-12 bg-card/20 border-2 border-border/40 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest hover:border-primary/40 transition-all focus:ring-primary/10">
                        <SelectValue placeholder="Select Platform" />
                     </SelectTrigger>
                     <SelectContent className="bg-background/95 backdrop-blur-xl border-2 border-border/40 rounded-2xl shadow-2xl">
                        {platforms.map(p => (
                           <SelectItem key={p} value={p} className="text-[10px] font-black uppercase tracking-widest py-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                              {p}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               {/* Status Selector */}
               <div className="space-y-2.5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-60">Mission Status</p>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                     <SelectTrigger className="w-full h-12 bg-card/20 border-2 border-border/40 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest hover:border-primary/40 transition-all focus:ring-primary/10">
                        <SelectValue placeholder="Select Status" />
                     </SelectTrigger>
                     <SelectContent className="bg-background/95 backdrop-blur-xl border-2 border-border/40 rounded-2xl shadow-2xl">
                        {statuses.map(s => (
                           <SelectItem key={s} value={s} className="text-[10px] font-black uppercase tracking-widest py-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                              {s}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>
         )}
      </div>
   );
}
