"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  Fingerprint,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/lib/redux/slices/authSlice";
import { authService } from "@/lib/services/auth-service";
import { RootState } from "@/lib/redux/store";
import { useEffect } from "react";
import Link from "next/link";

import { Logo } from "@/components/layout/Logo";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const data = await authService.register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      dispatch(loginSuccess({ 
        email: data.email, 
        full_name: data.full_name 
      }));
      
      toast.success("ACCESS GRANTED", {
        description: "Professional profile indexed. Welcome to the Pipeline."
      });
      
      router.push("/");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create professional ID.";
      dispatch(loginFailure(errorMsg));
      toast.error("IDENTIFICATION ERROR", {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[450px] relative z-10"
      >
        <Card className="bg-black/60 backdrop-blur-3xl border-2 border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-8 sm:p-12 relative">
          <Link href="/login" className="absolute top-8 left-8 text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Log In
          </Link>

          <div className="space-y-8 pt-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <Logo />
              <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                  Create Account
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">
                   Join Your Professional Career Hub
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Fingerprint size={18} />
                </div>
                <Input 
                  placeholder="YOUR FULL NAME"
                  className="bg-white/5 border-2 border-white/5 h-14 pl-12 rounded-2xl font-black uppercase text-[10px] tracking-widest focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <Input 
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-white/5 border-2 border-white/5 h-14 pl-12 rounded-2xl font-black uppercase text-[10px] tracking-widest focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <Input 
                  type="password"
                  placeholder="CHOOSE A PASSWORD"
                  className="bg-white/5 border-2 border-white/5 h-14 pl-12 rounded-2xl font-black uppercase text-[10px] tracking-widest focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <Button 
                disabled={isLoading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl mt-4 shadow-xl shadow-primary/20 group relative overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Create My Account
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Button>
            </form>

            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in here</Link>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
