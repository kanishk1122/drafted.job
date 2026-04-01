"use client";

import React from "react";
import { UploadCloud, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { uploadUserResume } from "@/lib/redux/slices/resumeSlice";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { toast } from "sonner";

export function ResumeUpload() {
  const dispatch = useAppDispatch();
  const { context } = useAppSelector((state) => state.profile);
  const { uploadStatus } = useAppSelector((state) => state.resume);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !context?.id) return;

    try {
      await dispatch(uploadUserResume({ userId: context.id, file })).unwrap();
      toast.success("Identity Reconstructed: Resume parsed successfully.");
      dispatch(fetchProfile()); // Refresh profile for context updates
    } catch (err: any) {
      toast.error(`Extraction Failed: ${err}`);
    }
  };

  return (
    <div className="pt-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.docx"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 group"
        disabled={uploadStatus === "loading"}
      >
        {uploadStatus === "loading" ? (
          <Zap size={14} className="animate-pulse mr-2" />
        ) : (
          <UploadCloud size={14} className="mr-2 group-hover:-translate-y-1 transition-transform" />
        )}
        {uploadStatus === "loading" ? "EXTRACTING..." : "UPDATE NEURAL DATA"}
      </Button>
      <p className="text-[8px] text-center text-muted-foreground uppercase tracking-widest mt-4 opacity-60">
        Supported: PDF, DOCX (Max 5MB)
      </p>
    </div>
  );
}
