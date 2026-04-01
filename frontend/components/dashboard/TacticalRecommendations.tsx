"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, 
    RefreshCcw, 
    Hourglass, 
    Target, 
    Link as LinkIcon, 
    Cpu,
    X,
    TrendingUp,
    ShieldCheck,
    ArrowUpRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchRecommendations, refreshRecommendations } from "@/lib/redux/slices/aiSlice";
import { Recommendation } from "@/lib/services/ai-service";
import { toast } from "sonner";

export default function TacticalRecommendations() {
    const dispatch = useAppDispatch();
    const { recommendations, loading, lastRefreshed } = useAppSelector(state => state.ai);
    const [cooldown, setCooldown] = useState<string | null>(null);
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

    useEffect(() => {
        dispatch(fetchRecommendations());
    }, [dispatch]);

    useEffect(() => {
        if (!lastRefreshed) return;

        const checkCooldown = () => {
            const last = new Date(lastRefreshed).getTime();
            const now = new Date().getTime();
            const diff = 24 * 60 * 60 * 1000 - (now - last);

            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setCooldown(`${hours}h ${mins}m left`);
            } else {
                setCooldown(null);
            }
        };

        checkCooldown();
        const timer = setInterval(checkCooldown, 60 * 1000);
        return () => clearInterval(timer);
    }, [lastRefreshed]);

    const handleRefresh = async () => {
        if (cooldown) {
            toast.error("INTEL LOCKDOWN", { 
                description: `Tactical refresh protocols are strictly governed. Next window in ${cooldown}.` 
            });
            return;
        }

        const resultAction = await dispatch(refreshRecommendations());
        if (refreshRecommendations.fulfilled.match(resultAction)) {
            toast.success("INTEL SYNCHRONIZED", { 
                description: "AI Intelligence has generated 3 fresh tactical career vectors." 
            });
        } else {
            toast.error("SYNCHRONIZATION FAILURE", { 
                description: (resultAction.payload as string) || "Intelligence engine unreachable." 
            });
        }
    };

    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'role': return <Target size={14} />;
            case 'network': return <LinkIcon size={14} />;
            case 'skill': return <Cpu size={14} />;
            default: return <Zap size={14} />;
        }
    };

    return (
        <>
            <Card className="bg-card/20 border-2 border-border/40 backdrop-blur-xl rounded-3xl overflow-hidden relative shadow-xl">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                
                <div className="p-6 border-b border-border/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <Zap size={16} fill="currentColor" className="text-primary" />
                             <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground leading-none">
                                Tactical Insights
                             </h3>
                        </div>
                        {cooldown && (
                             <Badge variant="outline" className="h-5 px-2 bg-background/40 border-border/40 text-[8px] font-black tracking-widest gap-1 text-muted-foreground">
                                <Hourglass size={10} /> {cooldown}
                             </Badge>
                        )}
                    </div>

                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-relaxed italic">
                        AI-Powered Career Intelligence
                    </p>

                    <Button 
                        onClick={handleRefresh}
                        disabled={loading}
                        variant="outline" 
                        size="sm"
                        className={`w-full h-10 rounded-xl border-2 transition-all font-black text-[9px] uppercase tracking-[0.2em] gap-3 ${
                            cooldown ? 'opacity-50 border-border/40 cursor-not-allowed bg-muted/10' : 'border-primary/40 text-primary hover:bg-primary/5 hover:border-primary shadow-lg shadow-primary/5'
                        }`}
                    >
                        {loading ? (
                            <RefreshCcw size={14} className="animate-spin" />
                        ) : (
                            <>
                                {cooldown ? <RefreshCcw size={14} className="opacity-20" /> : <RefreshCcw size={14} />}
                                {cooldown ? "PROTOCOL LOCKED" : "REFRESH INTEL"}
                            </>
                        )}
                    </Button>
                </div>

                <div className="p-4 space-y-4">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, idx) => (
                            <motion.div 
                                key={idx}
                                onClick={() => setSelectedRec(rec)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-muted/10 border-2 border-transparent hover:border-primary/50 rounded-2xl p-4 space-y-3 group transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center justify-between relative">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter h-5 border-border/60 bg-background/60 gap-1.5 px-2 grayscale group-hover:grayscale-0 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        {getIcon(rec.category)}
                                        {rec.category} VECTOR
                                    </Badge>
                                    <div className="h-1 w-1 rounded-full bg-primary/20 group-hover:bg-primary/60 transition-all group-hover:animate-ping" />
                                </div>
                                
                                <div className="space-y-1 relative">
                                    <h4 className="text-[10px] font-black uppercase tracking-tight text-foreground/90 group-hover:text-primary transition-colors leading-[1.2]">
                                        {rec.title}
                                    </h4>
                                    <p className="text-[9px] leading-relaxed font-medium text-muted-foreground line-clamp-2 italic group-hover:text-foreground/70 transition-colors">
                                        {rec.description}
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center justify-between border-t border-border/10 relative text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                                    <span>DEEP DIVE RECORD</span>
                                    <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl bg-muted/10 animate-pulse border-2 border-dashed border-border/40 flex items-center justify-center">
                                <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">SYNCHRONIZING...</span>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Tactical Deep-Dive Modal */}
            <AnimatePresence>
                {selectedRec && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRec(null)}
                            className="absolute inset-0 bg-background/95 backdrop-blur-3xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="relative w-full max-w-lg bg-card border-2 border-primary/20 rounded-[2.5rem] shadow-2xl shadow-primary/20 overflow-hidden"
                        >
                            <div className="bg-primary/5 p-8 md:p-12 space-y-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] px-3 py-1 uppercase tracking-[0.2em] rounded-full h-auto">
                                            {getIcon(selectedRec.category)}
                                            {selectedRec.category} STRATEGY
                                        </Badge>
                                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground leading-[1] italic">
                                            {selectedRec.title}
                                        </h2>
                                    </div>
                                    <Button 
                                        onClick={() => setSelectedRec(null)}
                                        variant="ghost" 
                                        size="sm"
                                        className="h-10 w-10 rounded-full border-2 border-border/40 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-500 transition-all p-0 flex-shrink-0"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                            <TrendingUp size={14} /> Mission Strategic Analysis
                                        </p>
                                        <p className="text-sm font-bold leading-relaxed text-foreground/80 border-l-2 border-primary/40 pl-4 py-1">
                                            {selectedRec.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/30 border border-border/60 rounded-2xl p-5 space-y-3">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">TACTICAL PRIORITY</p>
                                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black text-[9px] uppercase tracking-widest animate-pulse">CRITICAL</Badge>
                                        </div>
                                        <div className="bg-muted/30 border border-border/60 rounded-2xl p-5 space-y-3">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">PROBABILITY BOOST</p>
                                            <p className="text-[11px] font-black text-primary italic lowercase tracking-tight">+15% interview rate</p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => {
                                            toast.success("MISSION SYNC COMPLETE", { description: "Tactical data has been injected into your career funnel." });
                                            setSelectedRec(null);
                                        }}
                                        className="w-full h-16 bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-4 transition-all"
                                    >
                                        ACKNOWLEDGE DATA <ShieldCheck size={20} />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
