import React, { useState } from "react";
import { GraduationCap, Plus, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { updateResume, fetchMyResume } from "@/lib/redux/slices/resumeSlice";
import { toast } from "sonner";

interface NeuralConditioningProps {
  education: any[] | null | undefined;
}

export function NeuralConditioning({ education }: NeuralConditioningProps) {
  const dispatch = useAppDispatch();
  const { data: resume } = useAppSelector((state) => state.resume);
  const { context } = useAppSelector((state) => state.profile);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ degree: "", institution: "", duration: "" });

  const handleAddEducation = async () => {
    if (!formData.degree || !context?.id) return;
    
    const updatedEdu = [formData, ...(education || [])];
    try {
      await dispatch(updateResume({ userId: context.id, data: { education: updatedEdu } })).unwrap();
      toast.success("Identity Updated: Qualification logged.");
      setFormData({ degree: "", institution: "", duration: "" });
      setIsAdding(false);
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  const handleRemoveEducation = async (idx: number) => {
    if (!context?.id) return;
    const updatedEdu = (education || []).filter((_, i) => i !== idx);
    try {
      await dispatch(updateResume({ userId: context.id, data: { education: updatedEdu } })).unwrap();
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  return (
    <Card className="p-10 border-border/40 bg-muted/5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Education</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Schools & Degrees
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
          {isAdding ? "CANCEL" : "ADD EDUCATION"}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 space-y-4 border-b border-border/40 pb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Input 
                 placeholder="DEGREE / QUALIFICATION" 
                 value={formData.degree} 
                 onChange={e => setFormData({...formData, degree: e.target.value.toUpperCase()})}
                 className="bg-background/40 border-primary/20 text-[10px] font-black uppercase"
               />
               <Input 
                 placeholder="INSTITUTION" 
                 value={formData.institution} 
                 onChange={e => setFormData({...formData, institution: e.target.value.toUpperCase()})}
                 className="bg-background/40 border-primary/20 text-[10px] font-black uppercase"
               />
               <Input 
                 placeholder="YEARS (e.g. 2018 - 2022)" 
                 value={formData.duration} 
                 onChange={e => setFormData({...formData, duration: e.target.value.toUpperCase()})}
                 className="bg-background/40 border-primary/20 text-[10px] font-black uppercase"
               />
            </div>
            <Button onClick={handleAddEducation} className="w-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
               SYNC EDUCATION DATA
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {education?.map((edu: any, idx: number) => (
          <div key={idx} className="p-4 rounded-xl border border-border/40 bg-background/50 group relative">
            <h4 className="text-xs font-black uppercase tracking-tight">
              {edu.degree || edu.qualification}
            </h4>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">
              {edu.institution || edu.school}
            </p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-2">
              {edu.duration || edu.year}
            </p>
            <button 
              onClick={() => handleRemoveEducation(idx)}
              className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
