"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PenTool,
  Sparkles,
  FileDown,
  RefreshCcw,
  Briefcase,
  Layers,
  Eye,
  ChevronRight,
  Zap,
  GraduationCap,
  X,
  Plus,
  Palette,
  Maximize,
  StretchVertical,
  Undo2,
  Redo2,
  Keyboard
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
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
import { resumeService } from "@/lib/services/resume-service";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

// --- High-Fidelity A4 Constants ---
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

type TemplateID = 'INDUSTRIAL' | 'CLASSIC' | 'MODERN' | 'STEALTH' | 'CREATIVE' | 'EXECUTIVE';

export default function ResumeForgePage() {
  const dispatch = useAppDispatch();
  const { data: resume, status } = useAppSelector((state: RootState) => state.resume);
  const { context } = useAppSelector((state: RootState) => state.profile);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionsRef = useRef<any[]>(SectionIDMapping);

  const [forgeState, setForgeState] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState("");
  const [editingData, setEditingData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateID>('INDUSTRIAL');
  const [pageMargin, setPageMargin] = useState(45);
  const [componentGap, setComponentGap] = useState(30);

  // Initialize and persist state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('RESUME_FORGE_STATE');
      if (saved) {
        const parsed = JSON.parse(saved);
        setForgeState(parsed);
        setHistory([parsed]);
        setHistoryIndex(0);
      } else if (resume) {
        const initialState = {
          full_name: resume.full_name || "",
          email: resume.email || "",
          location: resume.location || "",
          summary: resume.summary || "",
          skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) || [] : resume.skills || [],
          experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) || [] : resume.experience || [],
          education: typeof resume.education === 'string' ? JSON.parse(resume.education) || [] : resume.education || [],
        };
        setForgeState(initialState);
        setHistory([initialState]);
        setHistoryIndex(0);
        localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(initialState));
      }
    }
  }, [resume]);

  const updateForgeState = useCallback((newState: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setForgeState(newState);
    localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(newState));
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setForgeState(history[prevIndex]);
      localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(history[prevIndex]));
      toast.info("UNDO COMPLETE", { icon: <Undo2 size={12} /> });
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setForgeState(history[nextIndex]);
      localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(history[nextIndex]));
      toast.info("REDO COMPLETE", { icon: <Redo2 size={12} /> });
    }
  }, [history, historyIndex]);

  // Integrated Keyboard Interface
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Meta (CMD) or Control
      const isControl = e.ctrlKey || e.metaKey;
      if (!isControl) return;

      const key = e.key.toLowerCase();

      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); // Ctrl+Shift+Z for Redo fallback
        else handleUndo();
      } else if (key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleReset = async () => {
    if (!context?.id) {
      toast.error("AUTHENTICATION REQUIRED");
      return;
    }

    try {
      toast.info("REFETCHING CORE INTELLIGENCE...");
      const latestResume = await resumeService.getMyResume(context.id);

      const initialState = {
        full_name: latestResume.full_name || "",
        email: latestResume.email || "",
        location: latestResume.location || "",
        summary: latestResume.summary || "",
        skills: typeof latestResume.skills === 'string' ? JSON.parse(latestResume.skills) || [] : latestResume.skills || [],
        experience: typeof latestResume.experience === 'string' ? JSON.parse(latestResume.experience) || [] : latestResume.experience || [],
        education: typeof latestResume.education === 'string' ? JSON.parse(latestResume.education) || [] : latestResume.education || [],
      };

      setForgeState(initialState);
      setHistory([initialState]);
      setHistoryIndex(0);
      localStorage.setItem('RESUME_FORGE_STATE', JSON.stringify(initialState));

      toast.success("CORE DATA SYNCHRONIZED", {
        description: "Local forge buffer updated with latest profile extracted data."
      });
    } catch (err) {
      toast.error("RESET HANDSHAKE FAILED");
    }
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const safeName = (forgeState?.full_name || "final").toLowerCase().split(' ').join('_');
    link.download = `resume_forge_${safeName}.png`; link.href = dataUrl;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("PNG BINARY EXPORTED");
  };

  const handleDownloadPDF = async () => {
    if (!forgeState) return;
    toast.success("PDF GENERATION STARTED");
    try {
      const doc = <ResumePDF data={forgeState} template={selectedTemplate} pageMargin={pageMargin} componentGap={componentGap} />;
      const asBlob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(asBlob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (forgeState?.full_name || "final").toLowerCase().split(' ').join('_');
      link.download = `resume_${safeName}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("TEXT-BASED PDF EXPORTED");
    } catch (err) {
      console.error(err); toast.error("PDF FORGE BREAKDOWN");
    }
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

    canvas.width = A4_WIDTH * 2; canvas.height = A4_HEIGHT * 2; ctx.scale(2, 2);

    const config: Record<TemplateID, any> = {
      INDUSTRIAL: { primary: '#2563eb', text: '#1a1a1a', secondary: '#64748b', font: 'Helvetica', headerAlign: 'center' },
      CLASSIC: { primary: '#000000', text: '#000000', secondary: '#333333', font: 'Times-Roman', headerAlign: 'center', noSkillBg: true },
      MODERN: { primary: '#6366f1', text: '#1e293b', secondary: '#6366f1', font: 'Helvetica', headerAlign: 'left' },
      STEALTH: { primary: '#0f172a', text: '#334155', secondary: '#94a3b8', font: 'Helvetica', headerAlign: 'center' },
      CREATIVE: { primary: '#ec4899', text: '#312e81', secondary: '#fb7185', font: 'Helvetica', headerAlign: 'left' },
      EXECUTIVE: { primary: '#059669', text: '#064e3b', secondary: '#10b981', font: 'Helvetica', headerAlign: 'center' }
    };

    const t = config[selectedTemplate];
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    const margin = pageMargin; const gap = componentGap;
    const eduList = Array.isArray(forgeState.education) ? forgeState.education : (forgeState.education?.education || forgeState.education?.EDUCATION || []);

    let currentY = margin + 35;
    const sections: any[] = [];

    // Header
    ctx.textAlign = t.headerAlign as "center" | "left";
    const headerX = t.headerAlign === 'center' ? A4_WIDTH / 2 : margin;
    if (selectedTemplate === 'MODERN' || selectedTemplate === 'CREATIVE') {
      ctx.fillStyle = t.primary; ctx.fillRect(margin - 15, currentY - 35, 4, 75);
    }
    ctx.fillStyle = t.text; ctx.font = `900 32px ${t.font}, sans-serif`;
    ctx.fillText((String(forgeState.full_name || "NAME")).toUpperCase(), headerX, currentY);

    currentY += (gap / 1.5) + 30;
    ctx.font = `700 12px ${t.font}, sans-serif`; ctx.fillStyle = t.secondary;
    ctx.fillText(`${forgeState.email}  |  ${forgeState.location || "LOCATION"}`, headerX, currentY);

    currentY += gap + 20;

    const drawSectionHeader = (title: string, y: number) => {
      ctx.textAlign = 'left'; ctx.fillStyle = t.primary; ctx.font = `900 12px ${t.font}, sans-serif`;
      if (selectedTemplate === 'EXECUTIVE') {
        ctx.fillRect(margin, y - 18, A4_WIDTH - (margin * 2), 24); ctx.fillStyle = '#fff';
        ctx.fillText(title.toUpperCase(), margin + 15, y - 1);
      } else {
        ctx.fillText(title.toUpperCase(), margin, y);
      }
      return y - 15;
    };

    // Summary
    const summaryStart = drawSectionHeader("Professional Summary", currentY);
    currentY += 35; ctx.textAlign = 'left'; ctx.fillStyle = '#1e293b'; ctx.font = `italic 500 13.5px ${t.font}, sans-serif`;
    const summaryLines = wrapText(ctx, `"${forgeState.summary || ""}"`, A4_WIDTH - (margin * 2));
    summaryLines.forEach(line => { ctx.fillText(line, margin, currentY); currentY += 22; });
    sections.push({ id: 'summary', startY: summaryStart, endY: currentY });

    currentY += gap;

    // Technical Skills
    const skillsStart = drawSectionHeader("Technical Skills", currentY);
    currentY += 35; let skillX = margin; ctx.font = `900 9.5px ${t.font}, sans-serif`; ctx.textAlign = 'left';
    (forgeState.skills || []).forEach((skill: any, i: number) => {
      const skillText = String(skill).toUpperCase();
      if (t.noSkillBg) {
        const label = i === 0 ? skillText : ` • ${skillText}`;
        const textWidth = ctx.measureText(label).width;
        if (skillX + textWidth > A4_WIDTH - margin) {
          skillX = margin; currentY += 25;
        }
        ctx.fillStyle = t.text;
        ctx.fillText(label, skillX, currentY - 1);
        skillX += textWidth + 10;
      } else {
        const textWidth = ctx.measureText(skillText).width;
        const badgeWidth = textWidth + 24;

        if (skillX + badgeWidth > A4_WIDTH - margin) {
          skillX = margin;
          currentY += 32;
        }

        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(skillX, currentY - 20, badgeWidth, 26);
        ctx.fillStyle = t.text;
        ctx.fillText(skillText, skillX + 12, currentY - 1);
        skillX += badgeWidth + 10;
      }
    });
    sections.push({ id: 'skills', startY: skillsStart, endY: currentY });

    currentY += gap + 10;

    // Experience
    const expStart = drawSectionHeader("Professional Experience", currentY);
    currentY += 40;
    (forgeState.experience || []).forEach((exp: any) => {
      ctx.textAlign = 'left'; ctx.fillStyle = t.text; ctx.font = `900 15px ${t.font}, sans-serif`;
      ctx.fillText((String(exp.role || "")).toUpperCase(), margin, currentY);
      ctx.textAlign = 'right'; ctx.fillStyle = t.secondary; ctx.font = `800 10.5px ${t.font}, sans-serif`;
      ctx.fillText((String(exp.duration || exp.period || "PRESENT")).toUpperCase(), A4_WIDTH - margin, currentY);

      ctx.textAlign = 'left'; currentY += 22; ctx.fillStyle = t.primary; ctx.font = `900 12.5px ${t.font}, sans-serif`;
      ctx.fillText((String(exp.company || "")).toUpperCase(), margin, currentY);

      currentY += 24; ctx.fillStyle = '#475569'; ctx.font = `500 12.5px ${t.font}, sans-serif`;
      const expLines = wrapText(ctx, String(exp.description || ""), A4_WIDTH - (margin * 2));
      expLines.forEach(line => { ctx.fillText(line, margin, currentY); currentY += 20; });
      currentY += 35;
    });
    sections.push({ id: 'experience', startY: expStart, endY: currentY });

    // Education
    if (eduList.length > 0) {
      currentY += gap - 10; if (currentY + 120 > A4_HEIGHT) currentY -= 20;
      const eduStart = drawSectionHeader("Education", currentY);
      currentY += 40;
      eduList.forEach((edu: any) => {
        ctx.textAlign = 'left'; ctx.fillStyle = t.text; ctx.font = `900 14px ${t.font}, sans-serif`;
        ctx.fillText((String(edu.degree || "")).toUpperCase(), margin, currentY);
        ctx.textAlign = 'right'; ctx.fillStyle = t.secondary; ctx.font = `800 10.5px ${t.font}, sans-serif`;
        ctx.fillText((String(edu.duration || "")).toUpperCase(), A4_WIDTH - margin, currentY);

        ctx.textAlign = 'left'; currentY += 22; ctx.fillStyle = t.primary; ctx.font = `bold 12px ${t.font}, sans-serif`;
        ctx.fillText((String(edu.institution || "")).toUpperCase(), margin, currentY);
        currentY += 30;
      });
      sections.push({ id: 'education', startY: eduStart, endY: currentY });
    }
    sectionsRef.current = sections;
  }, [forgeState, selectedTemplate, pageMargin, componentGap]);

  useEffect(() => {
    const timer = setTimeout(drawCanvas, 100); return () => clearTimeout(timer);
  }, [drawCanvas, forgeState, selectedTemplate, pageMargin, componentGap]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const scale = A4_WIDTH / rect.width;
    const y = (e.clientY - rect.top) * scale;
    const section = sectionsRef.current.find(s => y >= s.startY && y <= s.endY);
    if (section) handleOpenForge(section.id);
  };

  const handleAISectionRefine = async () => {
    setIsRefining(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/ai/enhance-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: context?.id, section: selectedNodeId, instructions: refineInstructions, current_data: forgeState })
      });
      const result = await response.json();
      updateForgeState(result.enhanced_data);
      setEditingData(result.enhanced_data[selectedNodeId!]);
      toast.success("AI ENHANCEMENT COMPLETE");
    } catch (err) {
      toast.error("AI HANDSHAKE FAILURE");
    } finally {
      setIsRefining(false); setRefineInstructions("");
    }
  };

  const handleManualSave = () => {
    const newState = { ...forgeState };
    newState[selectedNodeId!] = editingData;
    updateForgeState(newState);
    setIsForgeModalOpen(false);
    toast.success("BINARY DATA PERSISTED MANUALLY");
  };

  const handleOpenForge = (id: string | null) => {
    if (!id) return; setSelectedNodeId(id);
    let val: any = forgeState[id];
    if (id === 'education' && !Array.isArray(val)) val = val?.education || val?.EDUCATION || [];
    setEditingData(val); setIsForgeModalOpen(true);
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = (text || "").split(' '); const lines = []; let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (ctx.measureText(currentLine + " " + word).width < maxWidth) { currentLine += " " + word; } else { lines.push(currentLine); currentLine = word; }
    }
    lines.push(currentLine); return lines;
  };

  return (
    <div className="h-full flex flex-col gap-6 mx-auto w-full pb-10 px-6 sm:px-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-foreground italic flex items-center gap-4 leading-none">
            RESUME <span className="text-primary italic">FORGE</span> <PenTool className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">High-Intelligence Workflow</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-muted/20 border border-border/40 rounded-xl mr-2">
            <Button onClick={handleUndo} disabled={historyIndex <= 0} variant="ghost" className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-primary transition-all shadow-none" title="Undo (Ctrl+Z)">
              <Undo2 size={16} />
            </Button>
            <Button onClick={handleRedo} disabled={historyIndex >= history.length - 1} variant="ghost" className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-primary transition-all shadow-none" title="Redo (Ctrl+Y)">
              <Redo2 size={16} />
            </Button>
          </div>

          <Button onClick={handleReset} variant="outline" className="h-11 px-4 rounded-xl border-border bg-muted/40 font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-all">
            <RefreshCcw size={14} /> RESET
          </Button>
          <div className="flex items-center gap-2 p-1 bg-muted/20 border border-border/40 rounded-xl">
            <Button onClick={handleDownloadPNG} variant="ghost" className="h-9 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">PNG</Button>
            <Button onClick={handleDownloadPDF} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-black tracking-widest text-[10px] uppercase gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <FileDown size={14} /> DOWNLOAD PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        <div className="lg:col-span-3 space-y-6">


          <Card className="bg-card/40 border border-border/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-xl">
            <CardHeader className="p-5 border-b border-border/20 bg-muted/20"><CardTitle className="text-[10px] font-black flex items-center gap-2 tracking-[0.2em] uppercase"><PenTool className="h-3.5 w-3.5 text-primary" /> Data Nodes</CardTitle></CardHeader>
            <CardContent className="p-5 space-y-2">
              <TargetItem label="SUMMARY" icon={<Zap size={12} />} onClick={() => handleOpenForge('summary')} />
              <TargetItem label="EXPERIENCE" icon={<Briefcase size={12} />} onClick={() => handleOpenForge('experience')} />
              <TargetItem label="SKILLS" icon={<Layers size={12} />} onClick={() => handleOpenForge('skills')} />
              <TargetItem label="EDUCATION" icon={<GraduationCap size={12} />} onClick={() => handleOpenForge('education')} />
            </CardContent>
          </Card>

          <Card className="bg-card/40 border border-border/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-xl">
            <CardHeader className="p-5 border-b border-border/20 bg-muted/20"><CardTitle className="text-[10px] font-black flex items-center gap-2 tracking-[0.2em] uppercase"><Palette className="h-3.5 w-3.5 text-primary" /> Visual Core</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-2">
                {(['INDUSTRIAL', 'CLASSIC', 'MODERN', 'STEALTH', 'CREATIVE', 'EXECUTIVE'] as const).map(t => (
                  <Button key={t} onClick={() => setSelectedTemplate(t)} variant={selectedTemplate === t ? 'default' : 'outline'} className={cn("h-10 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all", selectedTemplate === t ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground border-border/40 hover:border-primary/40")}>{t}</Button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Maximize size={10} className="text-primary" /> Page Margin</label><span className="text-[10px] font-bold text-primary tabular-nums">{pageMargin}PX</span></div>
                <Slider value={[pageMargin]} onValueChange={(v) => setPageMargin(v[0])} min={20} max={100} step={1} className="my-2" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><StretchVertical size={10} className="text-primary" /> Component Gap</label><span className="text-[10px] font-bold text-primary tabular-nums">{componentGap}PX</span></div>
                <Slider value={[componentGap]} onValueChange={(v) => setComponentGap(v[0])} min={10} max={80} step={1} className="my-2" />
              </div>
              <div className="pt-2 flex items-center gap-2 opacity-40 hover:opacity-100 transition-all cursor-default">
                <Keyboard size={12} className="text-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest">Ctrl+Z: Undo | Ctrl+Y: Redo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9 flex flex-col">
          <Card className="bg-card/40 border border-border/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex-1 flex flex-col">
            <CardHeader className="p-6 border-b border-border/20 bg-muted/20 flex flex-row items-center justify-between">
              <CardTitle className="text-[12px] font-black flex items-center gap-3 tracking-[0.2em] uppercase italic"><Eye className="h-4 w-4 text-primary" /> A4 Forge Render</CardTitle>
              <div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary uppercase bg-primary/5">SELECTABLE TEXT READY</Badge></div>
            </CardHeader>
            <div className="flex-1 p-8 bg-muted/20 dark:bg-[#09090b]/40 relative overflow-y-auto no-scrollbar flex justify-center items-start">
              <div className="relative shadow-2xl rounded-sm bg-white overflow-hidden group">
                <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-[600px] h-auto cursor-crosshair transition-all" style={{ aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}` }} />
                <div className="absolute inset-0 border-4 border-primary/0 group-hover:border-primary/10 pointer-events-none transition-all" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isForgeModalOpen} onOpenChange={setIsForgeModalOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-3xl border-2 border-primary/20 sm:max-w-[650px] rounded-[3rem] shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-8 border-b border-border/20 space-y-1"><DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Forge Node: <span className="text-primary">{selectedNodeId?.toUpperCase()}</span></DialogTitle><DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Manual precision & AI re-forge terminal.</DialogDescription></div>
          <Tabs defaultValue="manual" className="w-full">
            <div className="px-8 pt-6"><TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/40 h-12 p-1">
              <TabsTrigger value="manual" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all"><PenTool size={14} /> Manual Edit</TabsTrigger>
              <TabsTrigger value="ai" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all"><Sparkles size={14} /> AI Re-Forge</TabsTrigger>
            </TabsList></div>
            <ScrollArea className="h-[450px] mt-6 px-8 py-2">
              <TabsContent value="manual" className="mt-0 space-y-6">
                {selectedNodeId === 'summary' && (<Textarea value={editingData} onChange={(e) => setEditingData(e.target.value)} className="min-h-[250px] rounded-3xl bg-muted/20 border-border p-6 text-sm font-medium leading-relaxed" />)}
                {selectedNodeId === 'skills' && (<Textarea value={editingData?.join(', ')} onChange={(e) => setEditingData(e.target.value.split(',').map((s: string) => s.trim()))} className="min-h-[150px] rounded-3xl bg-muted/20 border-border p-6 text-sm font-medium leading-relaxed" />)}
                {(selectedNodeId === 'experience' || selectedNodeId === 'education') && (<div className="space-y-6 pb-10">
                  {Array.isArray(editingData) ? editingData.map((item, idx) => (
                    <div key={idx} className="p-8 rounded-[2rem] bg-muted/20 border border-border/40 space-y-4 relative group hover:border-primary/20 transition-all">
                      <Button onClick={() => setEditingData(editingData.filter((_, i) => i !== idx))} variant="ghost" className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">{selectedNodeId === 'experience' ? 'Role' : 'Degree'}</span><input className="w-full h-11 px-4 rounded-xl bg-background border font-bold text-xs" value={item.role || item.degree || ""} onChange={(e) => { const n = [...editingData]; if (selectedNodeId === 'experience') n[idx].role = e.target.value; else n[idx].degree = e.target.value; setEditingData(n); }} /></div>
                        <div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">{selectedNodeId === 'experience' ? 'Company' : 'Institution'}</span><input className="w-full h-11 px-4 rounded-xl bg-background border font-bold text-xs" value={item.company || item.institution || ""} onChange={(e) => { const n = [...editingData]; if (selectedNodeId === 'experience') n[idx].company = e.target.value; else n[idx].institution = e.target.value; setEditingData(n); }} /></div>
                      </div>
                      <div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">Period</span><input className="w-full h-11 px-4 rounded-xl bg-background border font-bold text-xs" value={item.duration || item.period || ""} onChange={(e) => { const n = [...editingData]; if (selectedNodeId === 'experience') n[idx].period = e.target.value; else n[idx].duration = e.target.value; setEditingData(n); }} /></div>
                      {selectedNodeId === 'experience' && (<div className="space-y-1"><span className="text-[8px] font-black uppercase opacity-40">Mission Description</span><Textarea className="w-full min-h-[100px] p-4 rounded-2xl bg-background border font-medium text-xs no-scrollbar" value={item.description || ""} onChange={(e) => { const n = [...editingData]; n[idx].description = e.target.value; setEditingData(n); }} /></div>)}
                    </div>
                  )) : (<div className="p-8 text-center bg-muted/10 rounded-[2rem] border-2 border-dashed border-border"><p className="text-[10px] font-black uppercase opacity-40">No Data Detected.</p></div>)}
                  <Button onClick={() => setEditingData([...(Array.isArray(editingData) ? editingData : []), selectedNodeId === 'experience' ? { role: "", company: "", period: "", description: "" } : { degree: "", institution: "", duration: "" }])} className="w-full h-14 rounded-3xl border-2 border-dashed border-primary/20 text-primary font-black text-[11px] uppercase tracking-widest gap-2 hover:bg-primary/5 transition-all" variant="ghost"><Plus size={16} /> Add Node</Button>
                </div>)}
              </TabsContent>
              <TabsContent value="ai" className="mt-0 space-y-8 pb-10"><div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 space-y-4">
                <div className="flex items-center gap-3"><Sparkles className="text-primary h-5 w-5" /><h3 className="text-sm font-black uppercase tracking-tight">AI Enhancement Protocol</h3></div>
                <Textarea placeholder="e.g. 'Optimize for Senior React role'..." className="min-h-[150px] bg-background border-2 border-primary/20 rounded-2xl p-6 text-sm font-medium focus:border-primary transition-all" value={refineInstructions} onChange={(e) => setRefineInstructions(e.target.value)} />
                <Button onClick={handleAISectionRefine} disabled={isRefining || !refineInstructions.trim()} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-[12px] uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/20">{isRefining ? <RefreshCcw className="animate-spin" size={16} /> : <Zap size={16} />} {isRefining ? "SYNCING..." : "RE-FORGE WITH AI"}</Button>
              </div></TabsContent>
            </ScrollArea>
          </Tabs>
          <div className="p-8 border-t border-border/20 bg-muted/10 flex gap-4"><Button variant="ghost" onClick={() => setIsForgeModalOpen(false)} className="flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest">Abort</Button><Button onClick={handleManualSave} className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20">PERSIST CHANGES</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TargetItem({ label, icon, onClick }: any) {
  return (
    <Button onClick={onClick} variant="outline" className="h-12 rounded-xl border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 flex items-center justify-between px-5 group transition-all">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">{icon}</div>
        <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
      </div>
      <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary" />
    </Button>
  );
}

const SectionIDMapping = [
  { id: 'summary', startY: 0, endY: 0 },
  { id: 'skills', startY: 0, endY: 0 },
  { id: 'experience', startY: 0, endY: 0 },
  { id: 'education', startY: 0, endY: 0 }
];

const ResumePDF = ({ data, template, pageMargin, componentGap }: { data: any, template: TemplateID, pageMargin: number, componentGap: number }) => {
  const s = THEMES[template];
  const eduList = Array.isArray(data.education) ? data.education : (data.education?.education || data.education?.EDUCATION || []);
  const isClassic = template === 'CLASSIC';
  const dp = { ...s.page, padding: pageMargin };
  const ds = { marginTop: componentGap };

  return (
    <Document title={`${String(data.full_name || "RESUME")?.toUpperCase()}`}>
      <Page size="A4" style={dp}>
        <View style={s.header}>
          <Text style={s.name}>{String(data.full_name || "")?.toUpperCase()}</Text>
          <Text style={s.contact}>{String(data.email || "")} {isClassic ? '•' : '|'} {String(data.location || "")?.toUpperCase()}</Text>
        </View>
        <View style={ds}><Text style={s.sectionHeader}>Professional Summary</Text><Text style={s.summary}>{String(data.summary || "")}</Text></View>
        <View style={ds}><Text style={s.sectionHeader}>Technical Skills</Text><View style={s.skillContainer}>{(data.skills || []).map((skill: any, i: number) => (<Text key={i} style={s.skillBadge}>{isClassic && i > 0 ? `• ${String(skill).toUpperCase()}` : String(skill).toUpperCase()}</Text>))}</View></View>
        <View style={ds}><Text style={s.sectionHeader}>Professional Experience</Text>{(data.experience || []).map((exp: any, i: number) => (<View key={i} style={s.expItem}><View style={s.expHeader}><Text style={s.role}>{String(exp.role || "")?.toUpperCase()}</Text><Text style={s.duration}>{String(exp.duration || exp.period || "Present")?.toUpperCase()}</Text></View><Text style={s.company}>{String(exp.company || "")?.toUpperCase()}</Text><Text style={s.description}>{String(exp.description || "")}</Text></View>))}</View>
        {eduList.length > 0 && (<View style={ds}><Text style={s.sectionHeader}>Education</Text>{eduList.map((edu: any, i: number) => (<View key={i} style={s.eduItem}><View style={isClassic ? s.expHeader : {}}><Text style={s.degree}>{String(edu.degree || "")?.toUpperCase()}</Text>{isClassic && <Text style={s.duration}>{String(edu.duration || "")?.toUpperCase()}</Text>}</View><Text style={s.institution}>{String(edu.institution || "")?.toUpperCase()}</Text>{!isClassic && <Text style={s.duration}>{String(edu.duration || "")?.toUpperCase()}</Text>}</View>))}</View>)}
      </Page>
    </Document>
  );
};

const THEMES = {
  INDUSTRIAL: StyleSheet.create({
    page: { padding: 60, fontFamily: 'Helvetica', fontSize: 10.5, color: '#1a1a1a', lineHeight: 1.4 },
    header: { textAlign: 'center' },
    name: { fontSize: 26, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
    contact: { fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 },
    sectionHeader: { fontSize: 8.5, fontWeight: 'bold', textTransform: 'uppercase', color: '#2563eb', marginBottom: 10, paddingBottom: 3, letterSpacing: 1 },
    summary: { fontSize: 10.5, color: '#334155', lineHeight: 1.5 },
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    skillBadge: { fontSize: 7.5, padding: '3 7', backgroundColor: '#f8fafc', border: 0.5, borderColor: '#e2e8f0', borderRadius: 4, color: '#475569' },
    expItem: { marginBottom: 15 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 },
    role: { fontSize: 11.5, fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' },
    duration: { fontSize: 8, color: '#94a3b8', fontWeight: 'bold' },
    company: { fontSize: 9.5, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
    description: { fontSize: 9.5, color: '#4b5563', lineHeight: 1.5 },
    eduItem: { marginBottom: 10 },
    degree: { fontSize: 10.5, fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', marginBottom: 4 },
    institution: { fontSize: 9, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase' }
  }),
  CLASSIC: StyleSheet.create({
    page: { padding: 50, fontFamily: 'Times-Roman', fontSize: 11, color: '#000', lineHeight: 1.3 },
    header: { textAlign: 'center' },
    name: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
    contact: { fontSize: 10, fontStyle: 'italic', color: '#333' },
    sectionHeader: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: '#000', marginBottom: 10 },
    summary: { fontSize: 11, color: '#111' },
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    skillBadge: { fontSize: 9, color: '#000' },
    expItem: { marginBottom: 12 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
    role: { fontSize: 13, fontWeight: 'bold' },
    duration: { fontSize: 10, color: '#444' },
    company: { fontSize: 11, fontStyle: 'italic', marginBottom: 4 },
    description: { fontSize: 10.5, color: '#222' },
    eduItem: { paddingBottom: 8 },
    degree: { fontSize: 12, fontWeight: 'bold', marginBottom: 3 },
    institution: { fontSize: 10, color: '#444' }
  }),
  MODERN: StyleSheet.create({
    page: { padding: 60, fontFamily: 'Helvetica', fontSize: 10.5, color: '#1e293b', lineHeight: 1.6 },
    header: { textAlign: 'left', borderLeft: 4, borderLeftColor: '#6366f1', paddingLeft: 20 },
    name: { fontSize: 32, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 10 },
    contact: { fontSize: 9.5, color: '#6366f1', fontWeight: 'bold' },
    sectionHeader: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#6366f1', backgroundColor: '#f5f3ff', padding: '4 10', borderRadius: 6, marginBottom: 15, letterSpacing: 1.2 },
    summary: { fontSize: 11, color: '#334155', borderLeft: 2, borderLeftColor: '#e2e8f0', paddingLeft: 15, fontStyle: 'italic' },
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillBadge: { fontSize: 8, padding: '4 10', backgroundColor: '#6366f1', color: '#fff', borderRadius: 20, fontWeight: 'bold' },
    expItem: { marginBottom: 20, borderLeft: 1, borderLeftColor: '#f1f5f9', paddingLeft: 20 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 },
    role: { fontSize: 12.5, fontWeight: 'bold', color: '#1e1b4b' },
    duration: { fontSize: 9, color: '#94a3b8', backgroundColor: '#f8fafc', padding: '2 8', borderRadius: 4 },
    company: { fontSize: 10, color: '#6366f1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6 },
    description: { fontSize: 10, color: '#475569' },
    eduItem: { marginBottom: 15, paddingLeft: 20 },
    degree: { fontSize: 12, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 4 },
    institution: { fontSize: 10, color: '#6366f1', fontWeight: 'bold' }
  }),
  STEALTH: StyleSheet.create({
    page: { padding: 60, fontFamily: 'Helvetica', fontSize: 10, color: '#334155', lineHeight: 1.4 },
    header: { textAlign: 'center' },
    name: { fontSize: 30, fontWeight: 'bold', letterSpacing: 2, color: '#0f172a', marginBottom: 10 },
    contact: { fontSize: 9, color: '#94a3b8', marginTop: 5 },
    sectionHeader: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', marginBottom: 15, paddingTop: 5 },
    summary: { fontSize: 10.5, color: '#475569' },
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    skillBadge: { fontSize: 8, padding: '3 8', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: 2 },
    expItem: { marginBottom: 15 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    role: { fontSize: 12, fontWeight: 'bold' },
    duration: { fontSize: 9, color: '#94a3b8' },
    company: { fontSize: 10, color: '#334155', fontWeight: 'bold', marginBottom: 6 },
    description: { fontSize: 9.5 },
    eduItem: { marginBottom: 10 },
    degree: { fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
    institution: { fontSize: 10, color: '#64748b', fontWeight: 'bold' }
  }),
  CREATIVE: StyleSheet.create({
    page: { padding: 60, fontFamily: 'Helvetica', fontSize: 10.5, color: '#312e81', lineHeight: 1.5 },
    header: { textAlign: 'left', borderLeft: 8, borderLeftColor: '#ec4899', paddingLeft: 20 },
    name: { fontSize: 34, fontWeight: 'bold', color: '#be185d', marginBottom: 10 },
    contact: { fontSize: 10, color: '#fb7185', fontWeight: 'bold' },
    sectionHeader: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#ec4899', marginBottom: 12, letterSpacing: 2 },
    summary: { fontSize: 11, fontStyle: 'italic' },
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    skillBadge: { fontSize: 8, padding: '4 10', backgroundColor: '#fff1f2', color: '#be185d', borderRadius: 50, border: 1, borderColor: '#fecdd3' },
    expItem: { marginBottom: 15 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    role: { fontSize: 13, fontWeight: 'bold', color: '#831843' },
    duration: { fontSize: 8.5, color: '#fb7185' },
    company: { fontSize: 11, fontWeight: 'bold', color: '#ec4899', marginBottom: 5 },
    description: { fontSize: 10, color: '#4c0519' },
    eduItem: { marginBottom: 15 },
    degree: { fontSize: 12, fontWeight: 'bold', color: '#831843', marginBottom: 4 },
    institution: { fontSize: 10, color: '#fb7185', fontWeight: 'bold' }
  }),
  EXECUTIVE: StyleSheet.create({
    page: { padding: 60, fontFamily: 'Helvetica', fontSize: 10, color: '#064e3b', lineHeight: 1.4 },
    header: { textAlign: 'center', backgroundColor: '#ecfdf5', padding: 25, borderRadius: 8 },
    name: { fontSize: 28, fontWeight: 'bold', color: '#064e3b', marginBottom: 10 },
    contact: { fontSize: 9, color: '#10b981', marginTop: 8, letterSpacing: 1 },
    sectionHeader: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#fff', backgroundColor: '#059669', padding: '5 15', marginBottom: 15 },
    summary: { fontSize: 11, borderBottom: 1, borderBottomColor: '#d1fae5', paddingBottom: 15 },
    skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    skillBadge: { fontSize: 9, fontWeight: 'bold' },
    expItem: { marginBottom: 18 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    role: { fontSize: 13, fontWeight: 'bold' },
    duration: { fontSize: 10, color: '#10b981' },
    company: { fontSize: 11, fontStyle: 'italic', color: '#059669', marginBottom: 8 },
    description: { fontSize: 10 },
    eduItem: { marginBottom: 10 },
    degree: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    institution: { fontSize: 10, color: '#10b981', fontWeight: 'bold' }
  })
};
