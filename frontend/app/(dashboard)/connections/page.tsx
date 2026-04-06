"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Network, 
  Search, 
  Users, 
  Zap, 
  MapPin, 
  Link as LinkIcon, 
  ExternalLink,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Globe,
  Loader2,
  MoreVertical,
  Globe as GlobeIcon,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Recruiter {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  avatar?: string;
  connectionPath: string[]; // e.g. ["You", "Mutual friend", "Recruiter"]
  affinityScore: number;
}

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<Recruiter[]>([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);

  const handleScan = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsScanning(true);
    setResults([]);
    
    // Simulate Neural Scouting
    setTimeout(() => {
      const mockResult: Recruiter[] = [
        {
          id: "1",
          name: "Sarah Chen",
          role: "Technical Recruiting Lead",
          company: searchQuery || "Google",
          location: "San Francisco, CA",
          connectionPath: ["You", "Jason Miller (2nd)", "Sarah Chen"],
          affinityScore: 94
        },
        {
          id: "2",
          name: "Michael Rodriquez",
          role: "Senior Talent Scout",
          company: searchQuery || "Google",
          location: "Austin, TX",
          connectionPath: ["You", "Emily White (3rd)", "Michael Rodriquez"],
          affinityScore: 82
        },
        {
          id: "3",
          name: "Jessica Wu",
          role: "HR Business Partner",
          company: searchQuery || "Google",
          location: "New York, NY",
          connectionPath: ["You", "Alumni Network", "Jessica Wu"],
          affinityScore: 78
        }
      ];
      setResults(mockResult);
      setIsScanning(false);
      toast.success("NEURAL SCAN COMPLETE", {
        description: `Found ${mockResult.length} mission-critical connections at ${searchQuery}.`
      });
    }, 2500);
  }, [searchQuery]);

  // Deep Link Auto-Scan
  const searchParams = useSearchParams();
  useEffect(() => {
    const company = searchParams.get('company');
    if (company && !isScanning && results.length === 0) {
      setSearchQuery(company);
      // We need a way to trigger scan after state update. 
      // Easiest for now is just reuse the handleScan logic but with the new value
    }
  }, [searchParams, isScanning, results.length]);

  // Secondary effect to trigger once searchQuery is set from params
  useEffect(() => {
    const company = searchParams.get('company');
    if (company && searchQuery === company && !isScanning && results.length === 0) {
      handleScan();
    }
  }, [searchQuery, searchParams, handleScan, isScanning, results.length]);

  const handleIntercept = (recruiter: Recruiter) => {
    toast.info("INTERCEPTION MISSION INITIALIZED", {
      description: `Drafting neural bridge to ${recruiter.name} at ${recruiter.company}...`
    });
    // In a real scenario, this would trigger a backend mission to find the best referral path
  };

  return (
    <div className="h-full flex flex-col gap-8 mx-auto w-full pb-10 px-6 sm:px-10 max-w-7xl">
      {/* HEADER COMMAND */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-lg shadow-primary/5">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground italic leading-none">
                Neural <span className="text-primary italic">Network</span>
              </h1>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 ml-12">Recruiter Arbitrage & 2nd-Degree Interception</p>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
               placeholder="ENTER COMPANY DOMAIN OR TARGET ENTITY..." 
               className="h-14 pl-12 pr-4 bg-muted/20 border-border/40 rounded-2xl font-black text-[10px] tracking-widest uppercase focus:border-primary/40 focus:ring-primary/10 transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
          </div>
          <Button 
            onClick={handleScan} 
            disabled={isScanning || !searchQuery}
            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black tracking-[0.2em] text-[10px] uppercase gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
            {isScanning ? "SCANNING..." : "SCAN NODES"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* NETWORK SCANNER VISUALIZER */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="bg-card/40 border border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
              <CardHeader className="p-8 border-b border-border/20 flex flex-row items-center justify-between bg-muted/10">
                 <div className="space-y-1">
                    <CardTitle className="text-[12px] font-black flex items-center gap-3 tracking-[0.2em] uppercase italic">
                      <Target className="h-4 w-4 text-primary" /> Tactical Node Map
                    </CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Target Entity: {searchQuery || "IDLE"}</p>
                 </div>
                 <Badge variant="outline" className="h-8 px-4 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-black tracking-widest uppercase">
                    SYSTEM STATUS: {isScanning ? "SCOUTING" : "READY"}
                 </Badge>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 relative flex items-center justify-center overflow-hidden">
                 {isScanning ? (
                   <div className="relative flex flex-col items-center gap-6 z-10">
                      <div className="relative">
                         <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                         <Network className="h-24 w-24 text-primary animate-bounce" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] animate-pulse">Neural Scraper Active</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[300px]">Intercepting recruiter graph for {searchQuery} via LinkedIn API Inter-link.</p>
                      </div>
                   </div>
                 ) : results.length > 0 ? (
                    <div className="w-full h-full p-8 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                       {results.map((r, idx) => (
                         <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={r.id}
                         >
                            <Card 
                               onClick={() => setSelectedRecruiter(r)}
                               className={cn(
                                 "cursor-pointer group hover:border-primary/40 transition-all bg-muted/20 border-border/40 rounded-3xl overflow-hidden",
                                 selectedRecruiter?.id === r.id && "border-primary ring-1 ring-primary/20"
                               )}
                            >
                               <div className="p-6 space-y-4">
                                  <div className="flex items-start justify-between">
                                     <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                                           {r.name.charAt(0)}
                                        </div>
                                        <div>
                                           <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{r.name}</h3>
                                           <p className="text-[10px] font-bold text-muted-foreground uppercase">{r.role}</p>
                                        </div>
                                     </div>
                                     <div className="flex flex-col items-end gap-1">
                                        <span className="text-[18px] font-black text-primary tabular-nums italic">{r.affinityScore}%</span>
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">AFFINITY</span>
                                     </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                     <MapPin size={12} className="text-primary" /> {r.location}
                                  </div>
                                  
                                  <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                                     <div className="flex -space-x-2">
                                        {r.connectionPath.map((node, i) => (
                                          <div key={i} className="h-6 px-3 bg-background border border-border/40 rounded-full flex items-center justify-center text-[8px] font-black uppercase tracking-widest shadow-sm">
                                            {node.split(' ')[0]}
                                          </div>
                                        ))}
                                     </div>
                                     <Button variant="ghost" className="h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        ANALYZE BRIDGE
                                     </Button>
                                  </div>
                               </div>
                            </Card>
                         </motion.div>
                       ))}
                    </div>
                 ) : (
                   <div className="flex flex-col items-center gap-6 opacity-20 group">
                      <Globe className="h-40 w-40 text-muted-foreground group-hover:text-primary transition-all duration-700 group-hover:rotate-12" />
                      <p className="text-[12px] font-black uppercase tracking-[0.4em] text-center max-w-[400px]">Initialize scan to map target recruiter network graph.</p>
                   </div>
                 )}

                 {/* DYNAMIC BACKGROUND GRID */}
                 <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--primary) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
              </CardContent>
           </Card>
        </div>

        {/* NODE PROFILE READOUT */}
        <div className="lg:col-span-4 space-y-6">
           <AnimatePresence mode="wait">
              {selectedRecruiter ? (
                <motion.div
                   key={selectedRecruiter.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="space-y-6"
                >
                   <Card className="bg-card/60 border border-border/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-primary/10"></div>
                      <CardContent className="p-8 -mt-12 space-y-6 text-center">
                         <div className="inline-flex relative">
                            <div className="h-24 w-24 rounded-[2rem] bg-background border-4 border-card flex items-center justify-center text-4xl shadow-2xl relative z-10">
                               {selectedRecruiter.avatar ? <img src={selectedRecruiter.avatar} className="rounded-[1.8rem]" /> : <Users className="text-primary" />}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-full border-4 border-card flex items-center justify-center z-20 shadow-lg" title="High Response Probability">
                               <Zap size={14} className="text-white fill-white" />
                            </div>
                         </div>

                         <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic">{selectedRecruiter.name}</h2>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedRecruiter.role}</p>
                         </div>

                         <div className="grid grid-cols-2 gap-4 pb-4">
                            <div className="bg-muted/30 p-4 rounded-2xl space-y-1 border border-border/40">
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Affinity</p>
                               <p className="text-xl font-black text-primary tabular-nums italic">{selectedRecruiter.affinityScore}%</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-2xl space-y-1 border border-border/40">
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Degree</p>
                               <p className="text-xl font-black text-primary italic">2ND</p>
                            </div>
                         </div>

                         <div className="space-y-3 text-left">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Most Possible Neural Bridge</label>
                            <div className="space-y-2">
                               {selectedRecruiter.connectionPath.map((p, i) => (
                                 <div key={i} className="flex items-center gap-3 group/node">
                                    <div className="h-8 w-8 rounded-xl bg-muted border border-border flex items-center justify-center text-[10px] font-bold group-hover/node:border-primary/40 transition-colors">
                                       {i + 1}
                                    </div>
                                    <div className="flex-1 p-3 bg-muted/40 border border-border/40 rounded-xl flex items-center justify-between">
                                       <span className="text-[10px] font-black uppercase tracking-tight">{p}</span>
                                       {i < selectedRecruiter.connectionPath.length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="pt-6 space-y-3">
                            <Button 
                               onClick={() => handleIntercept(selectedRecruiter)}
                               className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-all"
                            >
                               <Zap size={18} className="group-hover:animate-pulse" /> INTERCEPT RECRUITER
                            </Button>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-border/60 bg-muted/40 font-black text-[10px] uppercase tracking-widest gap-2">
                               <ExternalLink size={14} className="text-primary" /> VIEW NETWORK PROFILE
                            </Button>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="bg-muted/20 border-2 border-dashed border-border/60 rounded-[2rem] p-6 text-center group hover:border-primary/40 transition-all">
                      <div className="flex flex-col items-center gap-3">
                         <ShieldCheck className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
                            Drafted AI uses decentralized network mapping to find referral anchors within your specific demographic node.
                         </p>
                      </div>
                   </Card>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/40 rounded-[3rem] opacity-40">
                   <Users className="h-12 w-12 mb-4 text-muted-foreground" />
                   <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px]">Select a recruiter node to analyze connection arbitrage.</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
