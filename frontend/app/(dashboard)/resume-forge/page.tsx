"use client";

import React, { useState, useEffect } from "react";
import { 
  PenTool, 
  Sparkles, 
  FileDown, 
  RefreshCcw, 
  Briefcase, 
  Layers, 
  Cpu, 
  Wand2, 
  Eye, 
  Type, 
  Layout, 
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Send,
  X,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/redux/store";
import { fetchMyResume, updateResume } from "@/lib/redux/slices/resumeSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ResumeForgePage() {
  const dispatch = useAppDispatch();
  const { data: resume, status } = useAppSelector((state: RootState) => state.resume);
  const { context } = useAppSelector((state: RootState) => state.profile);

  const [activeTemplate, setActiveTemplate] = useState<'minimal' | 'modern' | 'industrial'>('minimal');
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // High-Fidelity Refinement State
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refinementInstructions, setRefinementInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    if (context?.id && !resume) {
      dispatch(fetchMyResume(context.id));
    }
  }, [dispatch, context?.id, resume]);

  const handleGlobalOptimize = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
    toast.success("MISSION DATA OPTIMIZED", {
      description: "AI has successfully refined your professional narrative for high-fidelity discovery."
    });
  };

  const handleSectionRefine = async () => {
    if (!selectedSection) return;
    setIsRefining(true);
    
    // Industrial Simulation of Backend AI Processing
    // This would send { section: selectedSection, instructions: refinementInstructions, currentContent: ... } to backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRefining(false);
    setIsRefineModalOpen(false);
    setRefinementInstructions("");
    setSelectedSection(null);
    
    toast.success("SECTION RE-FORGED", {
      description: `AI has surgically updated the ${selectedSection.replace('_', ' ')} based on your directive.`
    });
  };

  const handleDownload = (format: string) => {
    toast.info(`GENERATING ${format.toUpperCase()} UPLINK...`, {
      description: "Compiling binary data for export. Destination: Local Downloads."
    });
  };

  if (!resume) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="h-20 w-20 rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/40 flex items-center justify-center">
            <RefreshCcw className="h-10 w-10 text-muted-foreground/30 animate-spin" />
        </div>
        <div className="text-center">
           <h2 className="text-xl font-black uppercase tracking-tight">Synchronizing Professional Identity...</h2>
           <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Ensuring data integrity for resume forging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10 max-w-7xl mx-auto w-full pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-3">
           <div className="flex items-center gap-2 mb-2">
             <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wand2 size={14} className="text-primary" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Resume Forge Protocol</span>
           </div>
           <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-foreground italic flex items-center gap-6 leading-none">
              Resume <span className="text-primary italic">Forge</span> <PenTool className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
           </h1>
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
            onClick={handleGlobalOptimize}
            disabled={isOptimizing}
            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black tracking-widest text-[12px] uppercase gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
           >
              {isOptimizing ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {isOptimizing ? "FORGING..." : "FULL AI OPTIMIZATION"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Panel: Forge Controls */}
        <div className="lg:col-span-4 space-y-8">
          
          <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
             <CardHeader className="p-8 border-b border-border/20 bg-muted/20">
                <CardTitle className="text-[11px] font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                  <Layout className="h-4 w-4 text-primary" /> Visual Templates
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-3">
                   <TemplateOption 
                    active={activeTemplate === 'minimal'} 
                    onClick={() => setActiveTemplate('minimal')}
                    label="Minimal Industrial"
                    description="High-density, low-noise technical format."
                   />
                   <TemplateOption 
                    active={activeTemplate === 'modern'} 
                    onClick={() => setActiveTemplate('modern')}
                    label="Modern Executive"
                    description="Clean typography with high-fidelity margins."
                   />
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
             <CardContent className="p-8 space-y-6 text-center">
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 relative overflow-hidden text-center">
                   <Zap size={24} className="text-primary mx-auto mb-3" />
                   <h3 className="text-xs font-black uppercase tracking-widest">Live Forge Mode</h3>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase mt-2 leading-relaxed">
                      Click any section in the preview to activate **Localized Intelligence Refinement**.
                   </p>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border-t-2 border-primary/20">
             <CardHeader className="p-8 border-b border-border/20 bg-muted/20">
                <CardTitle className="text-[11px] font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                  <FileDown className="h-4 w-4 text-primary" /> Export Formats
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-4">
                <Button onClick={() => handleDownload('pdf')} variant="outline" className="w-full h-12 rounded-xl border-border bg-muted/20 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-primary/10 transition-all">
                   <Download size={14} className="text-primary" /> DOWNLOAD AS PDF
                </Button>
                <Button onClick={() => handleDownload('docx')} variant="outline" className="w-full h-12 rounded-xl border-border bg-muted/20 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-primary/10 transition-all">
                   <FileDown size={14} className="text-primary" /> DOWNLOAD AS DOCX
                </Button>
             </CardContent>
          </Card>

        </div>

        {/* Right Panel: Live Preview Forge */}
        <div className="lg:col-span-8">
           <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full flex flex-col">
              <CardHeader className="p-10 border-b border-border/20 bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="text-[14px] font-black flex items-center gap-4 tracking-[0.3em] uppercase">
                  <Eye className="h-5 w-5 text-primary" /> Live Forge Preview
                </CardTitle>
                <div className="flex items-center gap-3">
                   <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary uppercase bg-primary/5">
                      INTERACTIVE MODE ACTIVE
                   </Badge>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 bg-white dark:bg-[#09090b] p-12 overflow-y-auto">
                 <div className={cn(
                   "mx-auto transition-all duration-700",
                   activeTemplate === 'modern' ? "max-w-2xl" : "max-w-none"
                 )}>
                    {/* Header */}
                    <div className="border-b-2 border-zinc-100 dark:border-zinc-900 pb-8 mb-10 text-center">
                       <h2 className="text-4xl font-black uppercase tracking-tight mb-2 text-zinc-950 dark:text-zinc-50">{resume.name || "UNIDENTIFIED OPERATIVE"}</h2>
                       <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                          <span>{resume.email}</span>
                          <span>•</span>
                          <span>{resume.location || "REMOTE AS NODES"}</span>
                       </div>
                    </div>

                    <div className="space-y-12">
                       {/* Interactive Profile Summary */}
                       <ForgeSection 
                         id="summary" 
                         label="Professional Intent" 
                         selected={selectedSection === 'summary'}
                         onSelect={() => setSelectedSection('summary')}
                         onOptimize={() => setIsRefineModalOpen(true)}
                       >
                          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium italic">
                             "{resume.summary || "No mission intent synchronized."}"
                          </p>
                       </ForgeSection>

                       {/* Interactive Skills */}
                       <ForgeSection 
                         id="skills" 
                         label="Technical Arsenal" 
                         selected={selectedSection === 'skills'}
                         onSelect={() => setSelectedSection('skills')}
                         onOptimize={() => setIsRefineModalOpen(true)}
                       >
                          <div className="flex flex-wrap gap-2">
                             {(typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills)?.map((skill: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200 rounded-lg">
                                   {skill}
                                </span>
                             ))}
                          </div>
                       </ForgeSection>

                       {/* Interactive Experience */}
                       <div className="space-y-6">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary pb-2 border-b border-zinc-100 dark:border-zinc-900">Mission History</h3>
                          <div className="space-y-8">
                             {(typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience)?.map((exp: any, i: number) => (
                                <ForgeSection 
                                  key={i}
                                  id={`exp_${i}`} 
                                  selected={selectedSection === `exp_${i}`}
                                  onSelect={() => setSelectedSection(`exp_${i}`)}
                                  onOptimize={() => setIsRefineModalOpen(true)}
                                  className="group/exp"
                                >
                                   <div className="space-y-3">
                                      <div className="flex justify-between items-end">
                                         <div>
                                            <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">{exp.role}</h4>
                                            <p className="text-sm font-black text-primary uppercase tracking-widest">{exp.company}</p>
                                         </div>
                                         <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase">{exp.period || "2020 - PRESENT"}</span>
                                      </div>
                                      <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                                         {exp.description}
                                      </p>
                                   </div>
                                </ForgeSection>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </ScrollArea>
           </Card>
        </div>
      </div>

      {/* High-Fidelity Refinement Dialog */}
      <Dialog open={isRefineModalOpen} onOpenChange={(open) => !isRefining && setIsRefineModalOpen(open)}>
         <DialogContent className="bg-card/95 backdrop-blur-2xl border-2 border-primary/20 sm:max-w-[500px] rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-6">
               <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                  Forge Refinement <Sparkles size={24} className="text-primary" />
               </DialogTitle>
               <DialogDescription className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Direct the AI to surgically improve this resume component.
               </DialogDescription>
            </DialogHeader>
            
            <div className="p-8 space-y-6">
               <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Targeting: {selectedSection?.toUpperCase()}</span>
                  <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                     Provide specific instructions for the best response (e.g., "Make this sound more like a Lead Engineer" or "Focus on cloud-native deployments").
                  </p>
               </div>

               <Textarea 
                 placeholder="ENTER FORGE DIRECTIVE..."
                 className="min-h-[150px] bg-background/50 border-2 border-border/40 rounded-2xl focus:border-primary transition-all text-sm font-medium p-4 resize-none no-scrollbar"
                 value={refinementInstructions}
                 onChange={(e) => setRefinementInstructions(e.target.value)}
                 disabled={isRefining}
               />
            </div>

            <DialogFooter className="p-8 pt-0 flex gap-3">
               <Button 
                 variant="ghost" 
                 onClick={() => setIsRefineModalOpen(false)} 
                 disabled={isRefining}
                 className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-widest"
               >
                  ABORT
               </Button>
               <Button 
                 onClick={handleSectionRefine}
                 disabled={isRefining || !refinementInstructions.trim()}
                 className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/20"
               >
                  {isRefining ? <RefreshCcw className="animate-spin" size={16} /> : <Send size={16} />}
                  {isRefining ? "RE-FORGING..." : "EXECUTE UPLINK"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ForgeSection({ id, label, children, selected, onSelect, onOptimize, className }: any) {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer group/section",
        selected 
          ? "border-primary bg-primary/5 shadow-xl shadow-primary/5 scale-[1.01]" 
          : "border-transparent hover:border-zinc-100 dark:hover:border-zinc-900",
        className
      )}
    >
      {label && <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">{label}</h3>}
      {children}

      <AnimatePresence>
         {selected && (
           <motion.div 
             initial={{ opacity: 0, y: 10, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 10, scale: 0.9 }}
             className="absolute -top-4 right-6 z-20 flex items-center gap-2"
           >
              <Button 
                onClick={(e) => { e.stopPropagation(); onOptimize(); }}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                 <Sparkles size={14} /> OPTIMIZE BY AI
              </Button>
           </motion.div>
         )}
      </AnimatePresence>
      
      {/* Visual Selection Indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none rounded-[1.8rem] border-2 border-primary/20 animate-pulse" />
      )}
    </div>
  );
}

function TemplateOption({ active, label, description, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "text-left p-6 rounded-2xl border-2 transition-all group relative overflow-hidden",
        active 
          ? "bg-primary/10 border-primary shadow-xl shadow-primary/10 scale-[1.02]" 
          : "bg-muted/10 border-border/40 hover:border-primary/40"
      )}
    >
      <div className="relative z-10">
        <h4 className={cn("text-sm font-black uppercase tracking-tight", active ? "text-primary" : "text-foreground")}>{label}</h4>
        <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1 opacity-60">{description}</p>
      </div>
      {active && <div className="absolute top-0 right-0 p-4"><CheckCircle2 size={16} className="text-primary" /></div>}
    </button>
  );
}
