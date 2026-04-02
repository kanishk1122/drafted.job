"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Shield, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const LS_KEY = "pipeline_config_v1";

export interface PipelineSettingsData {
  minMatchScore: number;
  showSalaryRange: boolean;
  defaultView: "kanban" | "list";
}

const defaultSettings: PipelineSettingsData = {
  minMatchScore: 0,
  showSalaryRange: true,
  defaultView: "kanban"
};

export function PipelineSettings({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (settings: PipelineSettingsData) => void;
}) {
  const [settings, setSettings] = useState<PipelineSettingsData>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load pipeline settings", e);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
    onSave(settings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-border/40 shadow-2xl bg-card overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between p-6">
                <CardTitle className="text-base font-black flex items-center gap-2.5 tracking-widest uppercase">
                  <SlidersHorizontal size={18} className="text-primary" />
                  Pipeline Configuration
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                  <X size={16} />
                </Button>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Min Match Score */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Shield size={12} className="text-primary" /> Minimum Match Threshold
                    </Label>
                    <span className="text-sm font-black text-foreground tabular-nums">{settings.minMatchScore}%</span>
                  </div>
                  <Slider 
                    value={[settings.minMatchScore]} 
                    onValueChange={(v: number[]) => setSettings({...settings, minMatchScore: v[0]})}
                    max={100} 
                    step={5} 
                    className="py-4"
                  />
                  <p className="text-[9px] text-muted-foreground italic leading-relaxed font-bold">
                    Only jobs with a match score higher than this threshold will be prioritized in your search sweeps and vault views.
                  </p>
                </div>

                <div className="h-[1px] bg-border/40 w-full" />

                {/* Toggles */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Estimate Salaries</Label>
                      <p className="text-[9px] text-muted-foreground font-bold">Show extrapolated salary data where available</p>
                    </div>
                    <Switch 
                      checked={settings.showSalaryRange} 
                      onCheckedChange={(checked) => setSettings({...settings, showSalaryRange: checked})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSave}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> SAVE CONFIGURATION
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
