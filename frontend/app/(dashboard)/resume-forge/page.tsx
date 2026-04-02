"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  PenTool, 
  Sparkles, 
  FileDown, 
  RefreshCcw, 
  Briefcase, 
  Layers, 
  Cpu, 
  Eye, 
  Layout, 
  CheckCircle2,
  ChevronRight,
  Zap,
  GraduationCap,
  X,
  Plus
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/redux/store";
import { fetchMyResume } from "@/lib/redux/slices/resumeSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- High-Fidelity A4 Constants ---
const A4_WIDTH = 794; 
const A4_HEIGHT = 1123; 

export default function ResumeForgePage() {
  const dispatch = useAppDispatch();
  const { data: resume, status } = useAppSelector((state: RootState) => state.resume);
  const { context } = useAppSelector((state: RootState) => state.profile);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionsRef = useRef<any[]>([]); 
  
  const [forgeState, setForgeState] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState("");
  const [editingData, setEditingData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('RESUME_FORGE_STATE');
      if (saved) {
        setForgeState(JSON.parse(saved));
      } else if (resume) {
        const initialState = {
          full_name: resume.full_name,
          email: resume.email,
          location: resume.location,
          summary: resume.summary,
          skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills,
          experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience,
          education: typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education || [],
        };
        setForgeState(initialState);
        localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(initialState));
      }
    }
  }, [resume]);

  useEffect(() => {
    if (forgeState && typeof window !== 'undefined') {
       localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(forgeState));
    }
  }, [forgeState]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `resume_forge_${forgeState?.full_name?.toLowerCase().replace(/ /g, '_') || 'final'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("PNG BINARY EXPORTED");
  };

  const handleDownloadPDF = () => {
    toast.success("TEXT-BASED PDF FORGE INITIALIZED", {
        description: "Executing high-fidelity DOM-to-PDF synchronization."
    });
    setTimeout(() => {
        window.print();
    }, 150);
  };

  useEffect(() => {
    if (context?.id && !resume) {
      dispatch(fetchMyResume(context.id));
    }
  }, [dispatch, context?.id, resume]);

  // --- Rendering Engine (Canvas Preview) ---
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !forgeState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = A4_WIDTH * 2;
    canvas.height = A4_HEIGHT * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    const margin = 55;
    const eduList = Array.isArray(forgeState.education) 
        ? forgeState.education 
        : (forgeState.education?.education || forgeState.education?.EDUCATION || []);

    const totalExpItems = (forgeState.experience || []).length;
    const totalEduItems = eduList.length;
    const isDense = (totalExpItems + totalEduItems) > 4;
    
    const spacing = { header: isDense ? 35 : 45, section: isDense ? 25 : 35, item: isDense ? 18 : 22, paragraph: isDense ? 16 : 19 };

    let currentY = 85;
    sectionsRef.current = [];

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillText((forgeState.full_name || "KANISHK SONI").toUpperCase(), A4_WIDTH / 2, currentY);
    currentY += 22;
    ctx.font = '700 11px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${forgeState.email}  |  ${forgeState.location || "RAJASTHAN"}`, A4_WIDTH / 2, currentY);

    currentY += spacing.header;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, currentY); ctx.lineTo(A4_WIDTH - margin, currentY); ctx.stroke();

    currentY += spacing.section;

    const drawSectionHeader = (title: string, y: number) => {
       ctx.textAlign = 'left';
       ctx.fillStyle = '#2563eb';
       ctx.font = '900 9px Inter, sans-serif';
       ctx.fillText(title.toUpperCase(), margin, y);
       ctx.strokeStyle = '#eff6ff';
       ctx.lineWidth = 0.5;
       ctx.beginPath();
       ctx.moveTo(margin, y + 5); ctx.lineTo(A4_WIDTH - margin, y + 5); ctx.stroke();
       return y - 10;
    };

    // Summary
    const summaryStart = drawSectionHeader("Professional Summary", currentY);
    currentY += 25;
    ctx.fillStyle = '#334155';
    ctx.font = 'italic 500 13px Inter, sans-serif';
    const summaryLines = wrapText(ctx, `"${forgeState.summary || ""}"`, A4_WIDTH - (margin * 2));
    summaryLines.forEach(line => { ctx.fillText(line, margin, currentY); currentY += spacing.paragraph; });
    sectionsRef.current.push({ id: 'summary', startY: summaryStart, endY: currentY });

    currentY += spacing.section;

    // Technical Skills
    const skillsStart = drawSectionHeader("Technical Skills", currentY);
    currentY += 25;
    let skillX = margin;
    ctx.font = '900 8.5px Inter, sans-serif';
    (forgeState.skills || []).forEach((skill: string) => {
       const textWidth = ctx.measureText(skill.toUpperCase()).width;
       ctx.fillStyle = '#f8fafc';
       ctx.fillRect(skillX, currentY - 14, textWidth + 14, 18);
       ctx.strokeStyle = '#2563eb15';
       ctx.strokeRect(skillX, currentY - 14, textWidth + 14, 18);
       ctx.fillStyle = '#0f172a';
       ctx.fillText(skill.toUpperCase(), skillX + 7, currentY - 1);
       skillX += textWidth + 24;
       if (skillX > A4_WIDTH - margin - 50) { skillX = margin; currentY += 22; }
    });
    sectionsRef.current.push({ id: 'skills', startY: skillsStart, endY: currentY });

    currentY += spacing.section;

    // Experience
    const expStart = drawSectionHeader("Professional Experience", currentY);
    currentY += 30;
    (forgeState.experience || []).forEach((exp: any) => {
       ctx.fillStyle = '#0f172a'; ctx.font = '900 15px Inter, sans-serif'; ctx.fillText((exp.role || "").toUpperCase(), margin, currentY);
       ctx.textAlign = 'right'; ctx.fillStyle = '#94a3b8'; ctx.font = '800 8.5px Inter, sans-serif'; ctx.fillText((exp.duration || exp.period || "PRESENT").toUpperCase(), A4_WIDTH - margin, currentY);
       ctx.textAlign = 'left'; currentY += 16; ctx.fillStyle = '#2563eb'; ctx.font = '900 10.5px Inter, sans-serif'; ctx.fillText((exp.company || "").toUpperCase(), margin, currentY);
       currentY += 18; ctx.fillStyle = '#475569'; ctx.font = '500 11.5px Inter, sans-serif';
       const expLines = wrapText(ctx, exp.description || "", A4_WIDTH - (margin * 2));
       expLines.forEach(line => { ctx.fillText(line, margin, currentY); currentY += spacing.paragraph; });
       currentY += spacing.item;
    });
    sectionsRef.current.push({ id: 'experience', startY: expStart, endY: currentY });

    // Education
    if (eduList.length > 0) {
        if (currentY + 100 > A4_HEIGHT) currentY -= 20;
        const eduStart = drawSectionHeader("Education", currentY);
        currentY += 30;
        eduList.forEach((edu: any) => {
            ctx.fillStyle = '#0f172a'; ctx.font = '900 14px Inter, sans-serif'; ctx.fillText((edu.degree || "").toUpperCase(), margin, currentY);
            ctx.textAlign = 'right'; ctx.fillStyle = '#94a3b8'; ctx.font = '800 8.5px Inter, sans-serif'; ctx.fillText((edu.duration || "").toUpperCase(), A4_WIDTH - margin, currentY);
            ctx.textAlign = 'left'; currentY += 16; ctx.fillStyle = '#475569'; ctx.font = 'bold 10px Inter, sans-serif'; ctx.fillText((edu.institution || "").toUpperCase(), margin, currentY);
            currentY += spacing.item;
        });
        sectionsRef.current.push({ id: 'education', startY: eduStart, endY: currentY });
    }
  }, [forgeState]);

  useEffect(() => {
    const timer = setTimeout(drawCanvas, 100);
    return () => clearTimeout(timer);
  }, [drawCanvas, forgeState]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = A4_WIDTH / rect.width;
    const y = (e.clientY - rect.top) * scale;
    const section = sectionsRef.current.find(s => y >= s.startY && y <= s.endY);
    if (section) handleOpenForge(section.id);
  };

  const handleOpenForge = (id: string | null) => {
    if (!id) return;
    setSelectedNodeId(id);
    let val: any = forgeState[id];
    if (id === 'education' && !Array.isArray(val)) val = val?.education || val?.EDUCATION || [];
    setEditingData(val);
    setIsForgeModalOpen(true);
  }

  const handleManualSave = () => {
    const newState = { ...forgeState };
    newState[selectedNodeId!] = editingData;
    setForgeState(newState);
    setIsForgeModalOpen(false);
    toast.success("BINARY DATA PERSISTED MANUALLY");
  };

  const handleAISectionRefine = async () => {
    setIsRefining(true);
    try {
        const response = await fetch('http://localhost:5000/api/v1/ai/enhance-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: context?.id, section: selectedNodeId, instructions: refineInstructions, current_data: forgeState })
        });
        const result = await response.json();
        setForgeState(result.enhanced_data);
        setEditingData(result.enhanced_data[selectedNodeId!]);
        toast.success("AI ENHANCEMENT COMPLETE");
    } catch (err) {
        toast.error("AI HANDSHAKE FAILURE");
    } finally {
        setIsRefining(false);
        setRefineInstructions("");
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = (text || "").split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if (ctx.measureText(currentLine + " " + word).width < maxWidth) { currentLine += " " + word; } else { lines.push(currentLine); currentLine = word; }
    }
    lines.push(currentLine); return lines;
  };

  return (
    <>
      {/* PERFECTED CSS PRINT PROTOCOL */}
      <style jsx global>{`
        @media print {
            @page { size: A4 portrait; margin: 0; }
            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            /* Hide the entire next.js app root to prevent blank pages */
            #__next, #root { display: none !important; }
        }
      `}</style>

      {/* ATS-OPTIMIZED PRINT MIRROR 
        This is hidden completely on screens, and visible ONLY on print.
        By avoiding fixed/absolute positioning, the browser properly calculates the bounds.
      */}
      <div className="hidden print:block w-[210mm] min-h-[297mm] mx-auto bg-white text-[#0f172a] font-sans pt-[15mm] px-[20mm]">
         <div className="text-center mb-8 border-b-2 border-slate-100 pb-6">
            <h1 className="text-3xl font-black tracking-tight uppercase mb-2 text-[#0f172a]">{(forgeState?.full_name || "").toUpperCase()}</h1>
            <p className="text-[11px] font-bold text-[#64748b] tracking-widest uppercase">
               {forgeState?.email} &nbsp;|&nbsp; {forgeState?.location?.toUpperCase()}
            </p>
         </div>
         
         <div className="space-y-8">
            <section className="break-inside-avoid">
               <h2 className="text-[10px] font-black tracking-[0.15em] uppercase text-[#2563eb] border-b border-slate-100 pb-2 mb-3">Professional Summary</h2>
               <p className="italic text-[13px] text-[#334155] leading-relaxed font-medium">"{forgeState?.summary}"</p>
            </section>

            <section className="break-inside-avoid">
               <h2 className="text-[10px] font-black tracking-[0.15em] uppercase text-[#2563eb] border-b border-slate-100 pb-2 mb-3">Technical Skills</h2>
               <div className="flex flex-wrap gap-2">
                  {(forgeState?.skills || []).map((skill: string, i: number) => (
                     <div key={i} className="px-3 py-1 bg-slate-50 border border-[#2563eb20] rounded-md text-[10px] font-bold uppercase text-[#0f172a]">{skill}</div>
                  ))}
               </div>
            </section>

            <section>
               <h2 className="text-[10px] font-black tracking-[0.15em] uppercase text-[#2563eb] border-b border-slate-100 pb-2 mb-4">Professional Experience</h2>
               <div className="space-y-6">
                  {(forgeState?.experience || []).map((exp: any, i: number) => (
                     <div key={i} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                           <h3 className="text-base font-black uppercase text-[#0f172a]">{exp.role}</h3>
                           <span className="text-[10px] font-bold text-[#94a3b8]">{(exp.duration || exp.period || "Present")?.toUpperCase()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#2563eb] mb-2 uppercase">{exp.company}</h4>
                        <p className="text-[13px] text-[#475569] leading-relaxed font-medium">{exp.description}</p>
                     </div>
                  ))}
               </div>
            </section>

            <section className="break-inside-avoid">
               <h2 className="text-[10px] font-black tracking-[0.15em] uppercase text-[#2563eb] border-b border-slate-100 pb-2 mb-4">Education</h2>
               <div className="space-y-4">
                  {(Array.isArray(forgeState?.education) ? forgeState.education : (forgeState?.education?.education || forgeState?.education?.EDUCATION || [])).map((edu: any, i: number) => (
                     <div key={i} className="flex justify-between items-start">
                        <div>
                           <h3 className="text-sm font-black uppercase text-[#0f172a]">{edu.degree}</h3>
                           <p className="text-[11px] font-bold text-[#475569] uppercase mt-1">{edu.institution}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">{(edu.duration || "").toUpperCase()}</span>
                     </div>
                  ))}
               </div>
            </section>
         </div>
      </div>

      {/* MAIN UI - Hidden during print */}
      <div className="h-full flex flex-col gap-10 max-w-7xl mx-auto w-full pb-20 print:hidden">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div className="space-y-3">
             <div className="flex items-center gap-2 mb-2">
               <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Layout size={14} className="text-primary" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">High-Intelligence Forge Hub</span>
             </div>
             <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-foreground italic flex items-center gap-6 leading-none">
                A4 <span className="text-primary italic">Forge</span> <PenTool className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
             </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <Button onClick={() => { localStorage.removeItem('RESUME_FORGE_STATE'); window.location.reload(); }} variant="outline" className="h-14 px-6 rounded-2xl border-border bg-muted/40 font-black text-[11px] uppercase tracking-widest gap-2 shadow-sm">
                <RefreshCcw size={16} /> RESET
             </Button>
             <div className="flex items-center gap-2 p-1.5 bg-muted/20 border border-border/40 rounded-2xl">
                <Button onClick={handleDownloadPNG} variant="ghost" className="h-11 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary transition-all">
                   PNG
                </Button>
                <Button onClick={handleDownloadPDF} className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-black tracking-widest text-[11px] uppercase gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                   <FileDown size={16} /> DOWNLOAD PDF
                </Button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
               <CardHeader className="p-8 border-b border-border/20 bg-muted/20">
                  <CardTitle className="text-[11px] font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                    <PenTool className="h-4 w-4 text-primary" /> Node Terminal
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-3">
                  <TargetItem label="SUMMARY" icon={<Zap size={14} />} onClick={() => handleOpenForge('summary')} />
                  <TargetItem label="EXPERIENCE" icon={<Briefcase size={14} />} onClick={() => handleOpenForge('experience')} />
                  <TargetItem label="SKILLS" icon={<Layers size={14} />} onClick={() => handleOpenForge('skills')} />
                  <TargetItem label="EDUCATION" icon={<GraduationCap size={14} />} onClick={() => handleOpenForge('education')} />
               </CardContent>
            </Card>
            <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border-t-2 border-primary/20">
               <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="h-10 w-10 border border-primary/30 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Cpu size={20} />
                     </div>
                     <div>
                        <h3 className="text-xs font-black uppercase tracking-tight italic text-primary">TEXT-PDF SYNC</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">ATS MISSION READY</p>
                     </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold text-center p-4 bg-muted/20 rounded-2xl border border-border/40 shadow-inner">
                     Your PDF is exported as searchable text binary, ensuring 100% hardware compatibility with top-tier recruitment scouts.
                  </p>
               </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
             <Card className="bg-card/40 border-2 border-border/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl relative flex-1 flex flex-col transition-all">
                <CardHeader className="p-10 border-b border-border/20 bg-muted/20 flex flex-row items-center justify-between">
                  <CardTitle className="text-[14px] font-black flex items-center gap-4 tracking-[0.3em] uppercase italic">
                    <Eye className="h-5 w-5 text-primary" /> Visual Document Preview
                  </CardTitle>
                  <div className="flex items-center gap-4">
                     <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary uppercase bg-primary/5">ONE-PAGE OPTOR</Badge>
                  </div>
                </CardHeader>
                <div className="flex-1 p-12 bg-muted/30 dark:bg-[#09090b]/40 relative overflow-y-auto no-scrollbar flex justify-center items-start">
                   <div className="relative shadow-[0_20px_120px_rgba(37,99,235,0.1)] rounded-sm bg-white overflow-hidden group cursor-text">
                      <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-[600px] h-auto" style={{ aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}` }} />
                   </div>
                </div>
             </Card>
          </div>
        </div>

        {/* Unified Forge Dialog */}
        <Dialog open={isForgeModalOpen} onOpenChange={setIsForgeModalOpen}>
           <DialogContent className="bg-card/95 backdrop-blur-3xl border-2 border-primary/20 sm:max-w-[650px] rounded-[3rem] shadow-2xl p-0 overflow-hidden">
              <div className="bg-primary/5 p-8 border-b border-border/20 space-y-1">
                 <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Forge Node: <span className="text-primary">{selectedNodeId?.toUpperCase()}</span></DialogTitle>
                 <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Manual precision & AI re-forge terminal.</DialogDescription>
              </div>
              <Tabs defaultValue="manual" className="w-full">
                 <div className="px-8 pt-6"><TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/40 h-12 p-1">
                    <TabsTrigger value="manual" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all"><PenTool size={14} /> Manual Edit</TabsTrigger>
                    <TabsTrigger value="ai" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all"><Sparkles size={14} /> AI Re-Forge</TabsTrigger>
                 </TabsList></div>
                 <ScrollArea className="h-[450px] mt-6 px-8 py-2">
                    <TabsContent value="manual" className="mt-0 space-y-6">
                       {selectedNodeId === 'summary' && (<Textarea value={editingData} onChange={(e) => setEditingData(e.target.value)} className="min-h-[250px] rounded-3xl bg-muted/20 border-border p-6 text-sm font-medium leading-relaxed" />)}
                       {selectedNodeId === 'skills' && (<Textarea value={editingData?.join(', ')} onChange={(e) => setEditingData(e.target.value.split(',').map((s: string)=>s.trim()))} className="min-h-[150px] rounded-3xl bg-muted/20 border-border p-6 text-sm font-medium leading-relaxed" />)}
                       {(selectedNodeId === 'experience' || selectedNodeId === 'education') && (<div className="space-y-6 pb-10">
                          {Array.isArray(editingData) ? editingData.map((item, idx) => (
                             <div key={idx} className="p-8 rounded-[2rem] bg-muted/20 border border-border/40 space-y-4 relative group hover:border-primary/20 transition-all">
                                <Button onClick={() => setEditingData(editingData.filter((_,i)=>i!==idx))} variant="ghost" className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></Button>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">{selectedNodeId==='experience'?'Role':'Degree'}</span><input className="w-full h-11 px-4 rounded-xl bg-background border font-bold text-xs" value={item.role||item.degree||""} onChange={(e)=>{const n=[...editingData]; if(selectedNodeId==='experience') n[idx].role=e.target.value; else n[idx].degree=e.target.value; setEditingData(n);}}/></div>
                                   <div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">{selectedNodeId==='experience'?'Company':'Institution'}</span><input className="w-full h-11 px-4 rounded-xl bg-background border font-bold text-xs" value={item.company||item.institution||""} onChange={(e)=>{const n=[...editingData]; if(selectedNodeId==='experience') n[idx].company=e.target.value; else n[idx].institution=e.target.value; setEditingData(n);}}/></div>
                                </div>
                                <div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">Period</span><input className="w-full h-11 px-4 rounded-xl bg-background border font-bold text-xs" value={item.duration||item.period||""} onChange={(e)=>{const n=[...editingData]; if(selectedNodeId==='experience') n[idx].period=e.target.value; else n[idx].duration=e.target.value; setEditingData(n);}}/></div>
                                {selectedNodeId==='experience' && (<div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">Mission Description</span><Textarea className="w-full min-h-[100px] p-4 rounded-2xl bg-background border font-medium text-xs no-scrollbar" value={item.description||""} onChange={(e)=>{const n=[...editingData]; n[idx].description=e.target.value; setEditingData(n);}}/></div>)}
                             </div>
                          )):( <div className="p-8 text-center bg-muted/10 rounded-[2rem] border-2 border-dashed border-border"><p className="text-[10px] font-black uppercase opacity-40">No Data Detected.</p></div> )}
                          <Button onClick={()=>setEditingData([...(Array.isArray(editingData)?editingData:[]), selectedNodeId==='experience'?{role:"",company:"",period:"",description:""}:{degree:"",institution:"",duration:""}])} className="w-full h-14 rounded-3xl border-2 border-dashed border-primary/20 text-primary font-black text-[11px] uppercase tracking-widest gap-2 hover:bg-primary/5 transition-all" variant="ghost"><Plus size={16}/> Add Node</Button>
                       </div>)}
                    </TabsContent>
                    <TabsContent value="ai" className="mt-0 space-y-8 pb-10"><div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 space-y-4">
                       <div className="flex items-center gap-3"><Sparkles className="text-primary h-5 w-5"/><h3 className="text-sm font-black uppercase tracking-tight">AI Enhancement Protocol</h3></div>
                       <Textarea placeholder="e.g. 'Optimize for Senior React role'..." className="min-h-[150px] bg-background border-2 border-primary/20 rounded-2xl p-6 text-sm font-medium focus:border-primary transition-all" value={refineInstructions} onChange={(e)=>setRefineInstructions(e.target.value)}/>
                       <Button onClick={handleAISectionRefine} disabled={isRefining||!refineInstructions.trim()} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-[12px] uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/20">{isRefining ? <RefreshCcw className="animate-spin" size={16}/> : <Zap size={16}/>} {isRefining ? "SYNCING..." : "RE-FORGE WITH AI"}</Button>
                    </div></TabsContent>
                 </ScrollArea>
              </Tabs>
              <div className="p-8 border-t border-border/20 bg-muted/10 flex gap-4">
                  <Button variant="ghost" onClick={()=>setIsForgeModalOpen(false)} className="flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest">Abort</Button>
                  <Button onClick={handleManualSave} className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20">PERSIST CHANGES</Button>
              </div>
           </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function TargetItem({ label, icon, onClick }: any) {
  return (
    <Button onClick={onClick} variant="outline" className="h-16 rounded-2xl border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 flex items-center justify-between px-8 group transition-all">
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/20 transition-all">{icon}</div>
          <span className="text-[11px] font-black tracking-widest uppercase">{label}</span>
       </div>
       <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
    </Button>
  );
}