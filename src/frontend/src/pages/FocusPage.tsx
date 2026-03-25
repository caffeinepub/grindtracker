import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pause, Play, RotateCcw, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type FocusSession, defaultFocusSessions } from "../data/mockData";

const SESSIONS_KEY = "grind_focus_sessions";
const XP_KEY = "grind_focus_xp";
const DEFAULT_DURATION = 25 * 60;

function loadSessions(): FocusSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) : defaultFocusSessions;
  } catch {
    return defaultFocusSessions;
  }
}

export default function FocusPage() {
  const [seconds, setSeconds] = useState(DEFAULT_DURATION);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>(loadSessions);
  const [totalXp, setTotalXp] = useState(() => {
    try {
      return Number.parseInt(localStorage.getItem(XP_KEY) || "0");
    } catch {
      return 0;
    }
  });
  const [justEarned, setJustEarned] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            completeSession();
            return DEFAULT_DURATION;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const completeSession = () => {
    const xpEarned = 50;
    const session: FocusSession = {
      id: Date.now().toString(),
      duration: 25,
      completedAt: new Date().toISOString(),
      xpEarned,
    };
    setSessions((prev) => {
      const updated = [session, ...prev];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
    setTotalXp((prev) => {
      const updated = prev + xpEarned;
      localStorage.setItem(XP_KEY, updated.toString());
      return updated;
    });
    setJustEarned(xpEarned);
    setTimeout(() => setJustEarned(0), 3000);
    toast.success(`Focus session complete! +${xpEarned} XP 🔥`);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(DEFAULT_DURATION);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - seconds / DEFAULT_DURATION;
  const circumference = 2 * Math.PI * 110;

  const totalFocusMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const todaySessions = sessions.filter((s) =>
    s.completedAt.startsWith("2026-03-25"),
  );

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-bold text-3xl mb-2">
          Focus <span className="gradient-text">Mode</span>
        </h1>
        <p className="text-muted-foreground mb-10">
          Deep work sessions that earn you XP and build your streak.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer */}
          <div className="card-surface rounded-2xl p-8 flex flex-col items-center">
            <div className="relative w-64 h-64 mb-8">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 260 260"
                role="img"
                aria-label="Focus timer progress"
              >
                <title>Focus timer progress</title>
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke="oklch(0.22 0.028 240)"
                  strokeWidth="12"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke={
                    running ? "oklch(0.82 0.12 196)" : "oklch(0.58 0.22 278)"
                  }
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  style={{
                    transition: "stroke-dashoffset 1s linear",
                    filter: `drop-shadow(0 0 12px ${running ? "oklch(0.82 0.12 196)" : "oklch(0.58 0.22 278)"})`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-6xl">
                  {String(minutes).padStart(2, "0")}:
                  {String(secs).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground text-sm mt-1">
                  {running
                    ? "Focus in progress..."
                    : seconds === DEFAULT_DURATION
                      ? "Ready to focus"
                      : "Paused"}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {justEarned > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 text-2xl font-bold text-green-400"
                  data-ocid="focus.success_state"
                >
                  +{justEarned} XP! 🎉
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={reset}
                data-ocid="focus.secondary_button"
                className="rounded-full w-12 h-12"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                data-ocid="focus.primary_button"
                className="w-16 h-16 rounded-full gradient-btn glow-cyan flex items-center justify-center text-background hover:scale-105 transition-transform"
              >
                {running ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <div className="w-12 h-12" />
            </div>

            <div className="flex gap-6 mt-8 text-center">
              <div>
                <div className="font-bold text-xl text-primary">
                  {totalFocusMinutes}m
                </div>
                <div className="text-xs text-muted-foreground">Total Focus</div>
              </div>
              <div>
                <div className="font-bold text-xl text-accent">
                  {totalXp + sessions.reduce((s, r) => s + r.xpEarned, 0)}
                </div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
              <div>
                <div className="font-bold text-xl text-green-400">
                  {sessions.length}
                </div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </div>
          </div>

          {/* Session log */}
          <div className="card-surface rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Session Log
            </h2>
            {todaySessions.length === 0 && (
              <div
                data-ocid="focus.empty_state"
                className="text-center py-8 text-muted-foreground"
              >
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  No sessions yet today. Start your first!
                </p>
              </div>
            )}
            <div className="space-y-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`focus.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 card-surface-light rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {session.duration}m session
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.completedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-0">
                    +{session.xpEarned} XP
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
