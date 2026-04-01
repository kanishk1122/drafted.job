import React, { useState } from "react";
import { User, Mail, MapPin, Phone, Orbit, Pencil, Check, X } from "lucide-react";
import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';
import { Card } from "@/components/ui/card";
import { ResumeData } from "@/lib/services/resume-service";
import { UserContext } from "@/lib/services/user-service";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/lib/redux/store";
import { updateResume, fetchMyResume } from "@/lib/redux/slices/resumeSlice";
import { toast } from "sonner";

interface ProfileHeaderProps {
  resume: ResumeData | null;
  context: UserContext | null;
}

export function ProfileHeader({ resume, context }: ProfileHeaderProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarSvg, setAvatarSvg] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    location: "",
    phone: ""
  });

  // Industrial Persona Pulse: Dynamic Dynamic Identity Refinement
  React.useEffect(() => {
    const fullName = resume?.full_name || context?.full_name || "";
    const userEmail = resume?.email || context?.email || "";
    
    // @ts-ignore
    const avatar = createAvatar(notionists, {
      "seed": fullName || userEmail || "professional",
      "radius": 10,
    });
    setAvatarSvg(avatar.toString());
  }, [resume?.full_name, resume?.email, context?.full_name, context?.email]);

  // Industrial Sync: Preload form with mission data when it stabilizes
  React.useEffect(() => {
    setFormData({
      full_name: resume?.full_name || context?.full_name || "",
      email: resume?.email || context?.email || "",
      location: resume?.location || "",
      phone: resume?.phone || ""
    });
  }, [resume, context]);

  const handleSave = async () => {
    if (!context?.id) return;
    try {
      await dispatch(updateResume({ userId: context.id, data: formData })).unwrap();
      toast.success("Identity Reconstructed: Basic data synced.");
      setIsEditing(false);
      dispatch(fetchMyResume(context.id));
    } catch (err: any) {
      toast.error(`Sync Failed: ${err}`);
    }
  };

  return (
    <Card className="p-8 border-primary/20 bg-primary/[0.02] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Orbit size={120} className="text-primary animate-[spin_20s_linear_infinite]" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="size-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20 overflow-hidden">
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: avatarSvg }} />
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg bg-muted/40 text-muted-foreground hover:text-primary transition-colors"
          >
            {isEditing ? <X size={16} /> : <Pencil size={16} />}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Input 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              placeholder="FULL NAME"
              className="bg-background/40 border-primary/20 text-sm font-black uppercase"
            />
            <Input 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="EMAIL ADDRESS"
              className="bg-background/40 border-primary/20 text-xs font-bold"
            />
            <Input 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="LOCATION (e.g. BANGALORE, IN)"
              className="bg-background/40 border-primary/20 text-xs font-bold uppercase"
            />
            <Input 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="PHONE NUMBER"
              className="bg-background/40 border-primary/20 text-xs font-bold"
            />
            <button 
               onClick={handleSave}
               className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
               <Check size={14} /> SAVE IDENTITY
            </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                {resume?.full_name || context?.full_name || "No Name"}
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">
                Profile Details
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted/40 flex items-center justify-center">
                  <Mail size={14} className="text-muted-foreground" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">{resume?.email || context?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted/40 flex items-center justify-center">
                  <MapPin size={14} className="text-muted-foreground" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">{resume?.location || "Remote Ops"}</span>
              </div>
              {resume?.phone && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-muted/40 flex items-center justify-center">
                    <Phone size={14} className="text-muted-foreground" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{resume.phone}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
