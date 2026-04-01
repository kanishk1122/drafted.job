"use client";

import React from "react";
import { Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchMyResume } from "@/lib/redux/slices/resumeSlice";
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

  React.useEffect(() => {
    dispatch(fetchProfile()).unwrap().then((ctx) => {
      if (ctx.id) dispatch(fetchMyResume(ctx.id));
    });
  }, [dispatch]);

  return (
    <DashboardLayout>
      <div className="py-10 px-6 sm:px-12">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10">
          
          {/* Left Column: Core Identity & Upload */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <ProfileHeader resume={resume} context={context} />
              
              <Card className="p-8 border-border/40 bg-muted/5 space-y-6">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">About Me</h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground font-medium italic opacity-80">
                  "{resume?.summary || "No summary extracted yet. Upload your latest resume to synchronize."}"
                </p>
                
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
