"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Cpu,
  Fingerprint,
  Loader2
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

import { Logo } from "@/components/layout/Logo";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
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
      const data = isLogin 
        ? await authService.login({ email: formData.email, password: formData.password })
        : await authService.register({ full_name: formData.fullName, email: formData.email, password: formData.password });

      // NEW: Secure Electron Cookie Hand-off
      if (typeof window !== "undefined" && (window as any).electron) {
        await (window as any).electron.invoke('set-auth-cookie', {
          name: 'access_token',
          value: data.access_token
        });
      }

      dispatch(loginSuccess({ 
        id: data.id,
        email: data.email, 
        full_name: data.full_name 
      }));
      
      toast.success(isLogin ? "IDENTITY VERIFIED" : "ACCESS GRANTED", {
        description: isLogin 
          ? "Welcome back. Re-establishing secure terminal session..." 
          : "Professional profile indexed. Welcome to the Pipeline."
      });
      
      router.push("/");
    } catch (error: any) {
      const errorMsg = error.message || "Invalid credentials or unauthorized access attempt detected.";
      dispatch(loginFailure(errorMsg));
      toast.error("AUTHENTICATION FAILED", {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none scale-150">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[450px] relative z-10"
      >
        <Card className="bg-black/60 backdrop-blur-3xl border-2 border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-8 sm:p-12 relative">
          {/* Top Visual Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="space-y-8">
            {/* Logo and Header */}
            <div className="flex flex-col items-center text-center space-y-6">
              <Logo />
              <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">
                   Integrated Secure Career Terminal
                </p>
              </div>
            </div>

            {/* Auth Toggle */}
            <div className="p-1.5 bg-white/5 rounded-2xl border border-white/5 flex gap-1 relative overflow-hidden">
               <motion.div
                  className="absolute inset-y-1.5 bg-white shadow-xl rounded-xl z-0"
                  initial={false}
                  animate={{ 
                    x: isLogin ? 0 : "100%", 
                    width: "calc(50% - 6px)" 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
               />
               <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors duration-300 ${isLogin ? "text-[#050505]" : "text-muted-foreground hover:text-white"}`}
               >
                  Log In
               </button>
               <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors duration-300 ${!isLogin ? "text-[#050505]" : "text-muted-foreground hover:text-white"}`}
               >
                  Sign Up
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="relative"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary">
                      <Fingerprint size={18} />
                    </div>
                    <Input 
                      placeholder="YOUR FULL NAME"
                      className="bg-white/5 border-2 border-white/5 h-14 pl-12 rounded-2xl font-black uppercase text-[10px] tracking-widest focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value.toUpperCase()})}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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
                  placeholder="YOUR PASSWORD"
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
                    {isLogin ? "Log In Now" : "Create My Account"}
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                {/* Visual feedback glow */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-4 space-y-4 text-center">
               <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                  {isLogin ? "New to the platform?" : "Already Have An Account?"}{" "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-primary hover:underline"
                  >
                    {isLogin ? "Sign Up" : "Log In"}
                  </button>
               </p>
               <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                 <ShieldCheck size={12} className="text-primary/40" /> Secure and Private Auth
               </p>
            </div>
          </div>
        </Card>

        {/* Branding Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
           <div className="h-0.5 w-12 bg-white/20" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Drafted.Jobs</p>
           <div className="h-0.5 w-12 bg-white/20" />
        </div>
      </motion.div>
    </div>
  );
}
