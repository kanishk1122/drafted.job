"use client";

import React from "react";
import { Briefcase, HelpCircle, Zap, Globe } from "lucide-react";

export default function VaultHeader() {
   return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 -mt-2">
         <div className="space-y-1 relative group/help-root">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-foreground flex items-center gap-2">
               Job Vault <Briefcase size={18} className="text-primary hidden sm:block" />
               <div className="relative">
                  <HelpCircle className="h-4 w-4 text-muted-foreground/40 hover:text-primary transition-colors cursor-help" />
                  
                  {/* Tactical Data Overlay (Hover) */}
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-[280px] sm:w-[350px] opacity-0 group-hover/help-root:opacity-100 pointer-events-none group-hover/help-root:pointer-events-auto transition-all duration-500 translate-x-4 group-hover/help-root:translate-x-0 z-[100]">
                     <div className="bg-card/95 backdrop-blur-2xl border-2 border-primary/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] space-y-6">
                        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Zap size={20} />
                           </div>
                           <div className="text-left">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Recruit Protocol</h3>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Vault Data v2.4.0</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="text-left">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                 <Briefcase size={12} /> RECRUITMENT OBJECTIVE
                              </p>
                              <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
                                 The Job Vault serves as the central repository for career opportunities. It secures drafted career data, tracks application progress, and organizes search strategies for professional execution.
                              </p>
                           </div>

                           <div className="space-y-3 text-left">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                 <Globe size={12} /> SEARCH VECTORS
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                 {[
                                    { name: "LINKEDIN", desc: "Global high-tier professional roles." },
                                    { name: "NAUKRI", desc: "Regional specialized talent data." },
                                    { name: "INDEED", desc: "Broad-spectrum corporate listings." }
                                 ].map(platform => (
                                    <div key={platform.name} className="flex flex-col p-2 rounded-lg bg-muted/20 border border-border/40">
                                       <span className="text-[8px] font-black text-foreground">{platform.name}</span>
                                       <span className="text-[8px] font-bold text-muted-foreground/60">{platform.desc}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </h1>
            <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Secured Job Repository & Drafting History</p>
         </div>

         <div className="flex items-center gap-4 sm:gap-6 bg-card/40 border border-border/40 px-4 sm:px-6 py-2.5 rounded-xl backdrop-blur-md shrink-0">
            <div className="text-center">
               <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Total</p>
               <p className="text-sm font-black text-foreground tabular-nums leading-tight">142</p>
            </div>
            <div className="h-6 w-[1px] bg-border/40" />
            <div className="text-center">
               <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Accuracy</p>
               <p className="text-sm font-black text-primary tabular-nums leading-tight">98.2%</p>
            </div>
            <div className="h-6 w-[1px] bg-border/40" />
            <div className="text-center">
               <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Active</p>
               <p className="text-sm font-black text-foreground tabular-nums leading-tight">12</p>
            </div>
         </div>
      </div>
   );
}
