"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraftCLOverlayProps {
   generatedCL: string | null;
   setGeneratedCL: (cl: string | null) => void;
}

export default function DraftCLOverlay({
   generatedCL,
   setGeneratedCL
}: DraftCLOverlayProps) {
   return (
      <AnimatePresence>
         {generatedCL && (
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute inset-4 z-50 bg-background/95 backdrop-blur-3xl border-2 border-primary/40 rounded-3xl flex flex-col shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] overflow-hidden"
            >
               <div className="p-6 border-b border-border/40 flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText size={16} className="text-primary" />
                     </div>
                     <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Drafted Intelligence</h3>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Cover Letter Draft v1.0</p>
                     </div>
                  </div>
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => setGeneratedCL(null)}
                     className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-500"
                  >
                     <X size={16} />
                  </Button>
               </div>
               <div className="flex-1 p-8">
                  <pre className="text-[11px] font-mono leading-relaxed text-primary/90 whitespace-pre-wrap h-full overflow-y-auto no-scrollbar">
                     {generatedCL}
                  </pre>
               </div>
               <div className="p-6 border-t border-border/40 grid grid-cols-2 gap-4 bg-muted/20">
                  <Button
                     onClick={() => {
                        if (generatedCL) navigator.clipboard.writeText(generatedCL);
                     }}
                     variant="outline"
                     className="h-10 border-2 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-primary/10 hover:border-primary/40 flex items-center gap-2"
                  >
                     <Copy size={14} /> COPY INTEL
                  </Button>
                  <Button
                     variant="outline"
                     className="h-10 border-2 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-primary/10 hover:border-primary/40 flex items-center gap-2"
                  >
                     <Download size={14} /> EXPORT PDF
                  </Button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
   );
}
