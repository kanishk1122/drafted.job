import React, { useState } from "react";
import { Briefcase, FileText, Plus, X, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { updateResume, fetchMyResume } from "@/lib/redux/slices/resumeSlice";
import { toast } from "sonner";

interface MissionHistoryProps {
  experience: any[] | null | undefined;
}

export function MissionHistory({ experience }: MissionHistoryProps) {
  const dispatch = useAppDispatch();
  const { data: resume } = useAppSelector((state) => state.resume);
  const { context } = useAppSelector((state) => state.profile);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ role: "", company: "", duration: "", description: "" });

  const handleAddExperience = async () => {
    if (!formData.role || !context?.id) return;
    
    const updatedExp = [formData, ...(experience || [])];
    try {
      await dispatch(updateResume({ userId: context.id, data: { experience: updatedExp } })).unwrap();
      toast.success("History Updated: Deployment logged.");
      setFormData({ role: "", company: "", duration: "", description: "" });
      setIsAdding(false);
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  const handleRemoveExperience = async (idx: number) => {
    if (!context?.id) return;
    const updatedExp = (experience || []).filter((_, i) => i !== idx);
    try {
      await dispatch(updateResume({ userId: context.id, data: { experience: updatedExp } })).unwrap();
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  return (
    <Card className="p-10 border-border/40 bg-muted/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Experience</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Work History
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase hover:bg-primary/10"
        >
          {isAdding ? <X size={14} className="mr-2" /> : <Plus size={14} className="mr-2" />}
          {isAdding ? "CANCEL" : "ADD POSITION"}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-10 space-y-4 border-b border-border/40 pb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Input 
                 placeholder="ROLE / TITLE" 
                 value={formData.role} 
                 onChange={e => setFormData({...formData, role: e.target.value.toUpperCase()})}
                 className="bg-background/40 border-primary/20 text-[10px] font-black uppercase"
               />
               <Input 
                 placeholder="COMPANY" 
                 value={formData.company} 
                 onChange={e => setFormData({...formData, company: e.target.value.toUpperCase()})}
                 className="bg-background/40 border-primary/20 text-[10px] font-black uppercase"
               />
               <Input 
                 placeholder="DURATION (e.g. 2022 - PRESENT)" 
                 value={formData.duration} 
                 onChange={e => setFormData({...formData, duration: e.target.value.toUpperCase()})}
                 className="bg-background/40 border-primary/20 text-[10px] font-black uppercase"
               />
            </div>
            <Textarea 
              placeholder="MISSION DESCRIPTION & KEY ACHIEVEMENTS..." 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="bg-background/40 border-primary/20 text-[10px] font-medium h-32"
            />
            <Button onClick={handleAddExperience} className="w-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
               SYNC MISSION DATA
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {experience?.length ? (
          experience.map((exp: any, idx: number) => (
            <div key={idx} className="relative pl-8 border-l border-border/20 group">
              <div className="absolute top-0 left-[-5px] size-2.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all border-4 border-background" />
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-black uppercase tracking-tight text-foreground">
                    {exp.role || exp.title}
                  </h4>
                  <div className="flex gap-2 items-center">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-1 rounded border border-primary/10">
                      {exp.duration || exp.dates || "PRESENT OPS"}
                    </span>
                    <button 
                      onClick={() => handleRemoveExperience(idx)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {exp.company || exp.organization}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium mt-2 whitespace-pre-wrap">
                  {exp.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 space-y-4">
            <FileText size={48} className="mx-auto text-muted-foreground opacity-20" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">
              Mission history archived or empty.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
