"use client";

import React from "react";

export function ConfigBlock({ label, value }: any) {
  return (
    <div className="flex items-center justify-between group">
       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{label}</span>
       <span className="text-[10px] font-black  text-foreground/90">{value}</span>
    </div>
  );
}
