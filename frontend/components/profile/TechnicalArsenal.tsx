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
    <Card className="p-10 border-border/40 bg-muted/5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Technical Skills</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Skills from Resume
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
          {isAdding ? "CANCEL" : "ADD SKILL"}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 flex gap-2"
          >
            <Input 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="ENTER NEW SKILL..."
              className="bg-background/50 border-primary/20 text-xs font-bold uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} className="bg-primary text-white text-[10px] font-black uppercase px-6">
              SYNC
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        {skills?.length ? (
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
                className="px-4 py-2 bg-background border-border/40 text-[9px] font-black uppercase tracking-widest hover:border-primary/40 transition-colors pr-8"
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
        )}
      </div>
    </Card>
  );
}
