"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommandControlsProps {
   platforms: string[];
   selectedPlatform: string;
   setSelectedPlatform: (platform: string) => void;
   showFilters: boolean;
   setShowFilters: (show: boolean) => void;
   searchQuery: string;
   setSearchQuery: (query: string) => void;
}

export default function CommandControls({
   platforms,
   selectedPlatform,
   setSelectedPlatform,
   showFilters,
   setShowFilters,
   searchQuery,
   setSearchQuery
}: CommandControlsProps) {
   return (
      <div className="space-y-4 shrink-0">
         <div className="flex items-center gap-4 py-1 px-1">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                  placeholder="PROBE MISSION TITLES, COMPANIES, OR TECH STACKS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card/40 border-border border-2 font-black text-[10px] tracking-widest uppercase rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/60 focus-visible:ring-4 transition-all"
               />
            </div>
            <Button
               variant="outline"
               onClick={() => setShowFilters(!showFilters)}
               className={`h-12 w-12 rounded-xl border-2 transition-all flex items-center justify-center p-0 ${showFilters ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border/60 hover:border-primary/40'}`}
            >
               <Filter size={18} />
            </Button>
         </div>

         {showFilters && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300 px-1">
               {platforms.map(platform => (
                  <Button
                     key={platform}
                     onClick={() => setSelectedPlatform(platform)}
                     variant="ghost"
                     className={`h-9 px-6 text-[9px] font-black tracking-widest uppercase rounded-full border-2 transition-all ${selectedPlatform === platform
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_5px_15px_rgba(var(--primary-rgb),0.3)]"
                        : "bg-muted/40 text-muted-foreground border-transparent hover:border-border hover:bg-muted/60"
                        }`}
                  >
                     {platform}
                  </Button>
               ))}
            </div>
         )}
      </div>
   );
}
