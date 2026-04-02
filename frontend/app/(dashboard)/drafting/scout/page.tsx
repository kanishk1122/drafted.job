"use client";

import React, { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft,  Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchingView, Thought, JobMatch } from "@/components/drafting/SearchingView";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fetchBrowserSessions, addLocalSession } from "@/lib/redux/slices/browserSlice";
import { fetchJobs, resetJobs, fetchJobMetrics } from "@/lib/redux/slices/jobSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const LS_KEY = "active_mission_state";

export default function MissionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading Mission Control...</div>}>
      <MissionPage />
    </Suspense>
  );
}

function MissionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth);

  // Get mission params from URL or localStorage
  const [platform, setPlatform] = useState(searchParams.get("platform") || "linkedin");
  const [targetRole, setTargetRole] = useState(searchParams.get("role") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "India");
  const isResuming = searchParams.get("resume") === "true";

  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [rejected, setRejected] = useState<JobMatch[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isAborting, setIsAborting] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Restore state if resuming
  useEffect(() => {
    if (isResuming) {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlatform(parsed.platform || "linkedin");
        setTargetRole(parsed.targetRole || "");
        setLocation(parsed.location || "India");
        setThoughts(parsed.thoughts || []);
        setJobs(parsed.jobs || []);
        setRejected(parsed.rejected || []);
        setIsDone(parsed.isDone || false);
      }
    }
  }, [isResuming]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ thoughts, jobs, rejected, isDone, platform, targetRole, location }));
  }, [thoughts, jobs, rejected, isDone, platform, targetRole, location]);

  const startScout = useCallback(() => {
    if (!user.userEmail) return;
    if (isResuming && !isDone && thoughts.length > 0) return; // Don't restart if already punya data and not done

    const params = new URLSearchParams({
      user_id: user.userEmail,
      platform,
      target_role: targetRole,
      location,
    });

    const es = new EventSource(`${API_BASE}/browser/scout?${params.toString()}`);
    esRef.current = es;

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      if (event.type === "session_created") {
        dispatch(addLocalSession({
          id: event.data.id,
          name: event.data.name,
          platform: event.data.platform,
          status: 'active',
          date: event.data.date || new Date().toISOString(),
          totalJobs: 0,
          breakdown: []
        }));
      } else if (event.type === "thinking") {
        const isMatch = event.message.startsWith("✅");
        const isSkip  = event.message.startsWith("⏭️");
        const isError = event.message.startsWith("❌") || event.message.startsWith("⛔") || event.message.startsWith("⚠️");
        setThoughts(prev => [...prev, {
          text: event.message,
          type: isMatch ? "match" : isSkip ? "skip" : isError ? "error" : "thinking"
        }]);
      } else if (event.type === "job_found") {
        setJobs(prev => [...prev, event.data]);
        toast.success(`Match: ${event.data.title}`);
      } else if (event.type === "job_skipped") {
        setRejected(prev => [...prev, event.data]);
      } else if (event.type === "done") {
        setThoughts(prev => [...prev, { text: "🏁 Mission Accomplished — Data Saved.", type: "done" }]);
        setIsDone(true);
        es.close();
      } else if (event.type === "error") {
        setThoughts(prev => [...prev, { text: `❌ Error: ${event.message}`, type: "error" }]);
        setIsDone(true);
        es.close();
      } else if (event.type === "chrome_offline") {
        es.close();
        if (typeof window !== "undefined" && (window as any).electron) {
          setThoughts(prev => [...prev, { text: "🔴 Chrome offline — auto-launching...", type: "error" }]);
          (window as any).electron.invoke("launch-chrome-debug", { userId: user.userEmail })
            .then(() => {
              setThoughts(prev => [...prev, { text: "⏳ Chrome starting... retrying in 8s.", type: "thinking" }]);
              setTimeout(() => {
                setThoughts(prev => [...prev, { text: "🔄 Reconnecting...", type: "thinking" }]);
                setIsDone(false);
                startScout();
              }, 8000);
            })
            .catch((err: any) => {
              setThoughts(prev => [...prev, { text: `❌ Auto-launch failed: ${err}`, type: "error" }]);
              setIsDone(true);
            });
        } else {
          setThoughts(prev => [...prev, { text: "❌ Browser Offline: Open Chrome from 'Connect' page.", type: "error" }]);
          setIsDone(true);
        }
      }
    };

    es.onerror = (err) => {
      console.error("SSE Error:", err);
      // We don't always want to show 'died' if it was a controlled close
      if (!isDone) {
        setThoughts(prev => [...prev, { text: "🔌 Stream connection died or timeout.", type: "error" }]);
        setIsDone(true);
      }
      es.close();
    };

    return () => es.close();
  }, [user.userEmail, platform, targetRole, location]); // Dependencies should only be starting parameters

  const hasStarted = useRef(false);

  useEffect(() => {
    // Reconnect bridge if mission is active and user is ready
    if (user.userEmail && !hasStarted.current && !isDone) {
      hasStarted.current = true;
      startScout();
    }
  }, [user.userEmail, startScout, isDone]);

  const handleFinish = () => {
    localStorage.removeItem(LS_KEY);
    
    // INDUSTRIAL RECOVERY: Force-sync global state to source-of-truth
    if (user.userEmail) {
      dispatch(fetchBrowserSessions(user.userEmail));
      dispatch(resetJobs());
      dispatch(fetchJobs({ limit: 50 }));
      dispatch(fetchJobMetrics());
    }

    router.push("/drafting");
  };

  return (
  
      <div className="h-full min-h-[600px] flex flex-col p-4 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.push("/drafting")} className="gap-2">
            <ArrowLeft size={16} /> EXIT TO HUB
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border">
              MISSION RUNTIME: LIVE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <SearchingView
            thoughts={thoughts}
            jobs={jobs}
            rejected={rejected}
            isDone={isDone}
            targetRole={targetRole}
            platform={platform}
            onStop={() => { esRef.current?.close(); setIsDone(true); }}
            onFinish={handleFinish}
            
            onAbortStateChange={(val) => setIsAborting(val)}
          />
        </div>

        {isDone && !isAborting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <Button onClick={handleFinish} className="rounded-full px-12 h-16 font-black text-xs uppercase shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.6)] transition-all duration-500 gap-3 border-2 border-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Home size={18} className="animate-pulse" /> RETURN TO CONTROL HUB
            </Button>
          </motion.div>
        )}
      </div>
  );
}
