"use client";

import React, { useState } from "react";
import { Code, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { updateResume, fetchMyResume } from "@/lib/redux/slices/resumeSlice";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TechnicalArsenalProps {
  skills: string[] | null | undefined;
}

export function TechnicalArsenal({ skills }: TechnicalArsenalProps) {
  const dispatch = useAppDispatch();
  const { data: resume } = useAppSelector((state) => state.resume);
  const { context } = useAppSelector((state) => state.profile);
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [batchSkills, setBatchSkills] = useState("");

  React.useEffect(() => {
    if (skills) {
      setBatchSkills(skills.join(", "));
    }
  }, [skills]);

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !context?.id) return;
    
    const updatedSkills = [...(skills || []), newSkill.trim()];
    try {
      await dispatch(updateResume({ userId: context.id, data: { skills: updatedSkills } })).unwrap();
      toast.success("Arsenal Updated: Target skill added.");
      setNewSkill("");
      setIsAdding(false);
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  const handleSaveBatch = async () => {
    if (!context?.id) return;
    const updatedSkills = batchSkills.split(",").map(s => s.trim()).filter(s => s !== "");
    try {
      await dispatch(updateResume({ userId: context.id, data: { skills: updatedSkills } })).unwrap();
      toast.success("Arsenal Reconfigured: All skill vectors synced.");
      setIsEditingFull(false);
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!context?.id) return;
    const updatedSkills = (skills || []).filter(s => s !== skillToRemove);
    try {
      await dispatch(updateResume({ userId: context.id, data: { skills: updatedSkills } })).unwrap();
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  return (
    <Card className="p-10 border-border/40 bg-muted/5 relative overflow-hidden">
      {/* Neural Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Technical Skills</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Core Technical Arsenal
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
            {!isEditingFull && (
                <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAdding(!isAdding)}
                className="rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase hover:bg-primary/10"
                >
                {isAdding ? <X size={14} className="mr-2" /> : <Plus size={14} className="mr-2" />}
                {isAdding ? "CANCEL" : "ADD SKILL"}
                </Button>
            )}
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingFull(!isEditingFull)}
                className={`rounded-lg border-border/40 text-[10px] font-black uppercase transition-all ${isEditingFull ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-muted/10 text-muted-foreground hover:bg-muted/20'}`}
            >
                {isEditingFull ? <X size={14} className="mr-2" /> : <Code size={14} className="mr-2" />}
                {isEditingFull ? "CANCEL" : "BATCH EDIT"}
            </Button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && !isEditingFull && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 flex gap-2 relative z-10"
          >
            <Input 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="ENTER NEW SKILL..."
              className="bg-background/50 border-primary/20 text-xs font-bold uppercase h-12"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} className="bg-primary text-white text-[10px] font-black uppercase px-8 h-12">
              SYNC
            </Button>
          </motion.div>
        )}

        {isEditingFull && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 space-y-4 relative z-10"
            >
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">Neural Skill Matrix (Comma Separated)</p>
                    <textarea 
                        value={batchSkills}
                        onChange={(e) => setBatchSkills(e.target.value)}
                        className="w-full h-32 bg-background/50 border border-primary/20 rounded-lg p-4 text-xs font-medium focus:outline-none focus:border-primary transition-all uppercase leading-loose"
                        placeholder="React, Node.js, Python, AWS..."
                    />
                </div>
                <Button 
                    onClick={handleSaveBatch}
                    className="w-full bg-primary text-white text-[10px] font-black uppercase tracking-widest py-6 rounded-xl shadow-lg shadow-primary/20"
                >
                    RECONFIGURE ARSENAL
                </Button>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 relative z-10">
        {!isEditingFull && (skills?.length ? (
          skills.map((skill, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className="group relative"
            >
              <Badge
                variant="outline"
                className="px-4 py-2 bg-background border-border/40 text-[9px] font-black uppercase tracking-widest hover:border-primary/40 transition-colors pr-8 min-h-[32px] flex items-center"
              >
                {skill}
              </Badge>
              <button 
                onClick={() => handleRemoveSkill(skill)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
              >
                <X size={10} />
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground opacity-60 uppercase tracking-widest py-4">
            Arsenal empty. Initialize upload or add manually.
          </p>
        ))}
      </div>
    </Card>
  );
}
