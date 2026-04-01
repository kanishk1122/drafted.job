"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/logo.svg";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div className="relative">
        <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] overflow-hidden">
          <motion.div
            initial={{ rotate: 0, scale: 1 }}
            whileHover={{ rotate: 0, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Image src={logo} alt="Logo" className="text-primary size-[100%]" />
          </motion.div>
          {/* Scanning Effect Overlay */}
          {/* <motion.div 
            className="absolute inset-x-0 h-[1px] bg-primary/40 shadow-[0_0_8px_var(--primary)] z-10"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          /> */}
        </div>
      </div>

      <div className="flex flex-col -space-y-1">
        <h1 className={cn("text-xl font-black uppercase tracking-tighter text-foreground", textClassName)}>
          DRAFTED<span className="text-primary">.JOBS</span>
        </h1>

      </div>
    </div>
  );
}
