"use client";

import React from "react";
import { Pencil, Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchMyResume, updateResume } from "@/lib/redux/slices/resumeSlice";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

// Modular Components
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { TechnicalArsenal } from "@/components/profile/TechnicalArsenal";
import { MissionHistory } from "@/components/profile/MissionHistory";
import { NeuralConditioning } from "@/components/profile/NeuralConditioning";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { context } = useAppSelector((state) => state.profile);
  const { data: resume } = useAppSelector((state) => state.resume);

  const [isEditingSummary, setIsEditingSummary] = React.useState(false);
  const [summaryValue, setSummaryValue] = React.useState("");

  React.useEffect(() => {
    const bootstrapProfile = async () => {
       // Parallel Bootstrap: Fetch both identity context and mission resume simultaneously
       // Both use 'condition' inside their thunks for smart caching, so redundancy is safe.
       const promises: any[] = [];
       
       if (!context) promises.push(dispatch(fetchProfile()));
       
       // Metrics are global, useful to have fully cached
       // dispatch(fetchJobMetrics()); // Could add this here too

       await Promise.all(promises);
    };

    bootstrapProfile();
  }, [dispatch, context]);

  // Separate resume fetch that depends on context availability
  React.useEffect(() => {
     if (context?.id && !resume) {
        dispatch(fetchMyResume(context.id));
     }
  }, [dispatch, context?.id, resume]);

  // Preload summary
  React.useEffect(() => {
    if (resume?.summary) setSummaryValue(resume.summary);
  }, [resume?.summary]);

  const handleSaveSummary = async () => {
    if (!context?.id) return;
    try {
      await dispatch(updateResume({ userId: context.id, data: { summary: summaryValue } })).unwrap();
      setIsEditingSummary(false);
      dispatch(fetchMyResume(context.id));
    } catch (err) {
      // Toast already handled or add local handling
    }
  };

  return (
    <DashboardLayout>
      <div className="py-10 px-6 sm:px-12">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10">
          
          {/* Left Column: Core Identity & Upload */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <ProfileHeader resume={resume} context={context} />
              
              <Card className="p-8 border-border/40 bg-muted/5 space-y-6 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">About Me</h3>
                  </div>
                  <button 
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                  >
                    {isEditingSummary ? "CANCEL" : <Pencil size={12} />}
                  </button>
                </div>

                {isEditingSummary ? (
                   <div className="space-y-4">
                      <textarea 
                        className="w-full h-40 bg-background/40 border border-primary/20 rounded-lg p-4 text-xs font-medium focus:outline-none focus:border-primary transition-all"
                        value={summaryValue}
                        onChange={(e) => setSummaryValue(e.target.value)}
                        placeholder="DEFINE YOUR PROFESSIONAL IDENTITY..."
                      />
                      <button 
                        onClick={handleSaveSummary}
                        className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                      >
                         SAVE MISSION SUMMARY
                      </button>
                   </div>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium italic opacity-80">
                    "{resume?.summary || "No summary extracted yet. Upload your latest resume to synchronize."}"
                  </p>
                )}
                
                <ResumeUpload />
              </Card>
            </div>
          </div>

          {/* Right Column: Experience & Skills */}
          <div className="lg:col-span-8 space-y-8">
            <TechnicalArsenal skills={resume?.skills} />
            <MissionHistory experience={resume?.experience} />
            <NeuralConditioning education={resume?.education} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
