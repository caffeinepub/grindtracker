import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pause, Play, RotateCcw, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";

const DEFAULT_DURATION = 25 * 60;

export default function FocusPage() {
  const { profile, focusSessions, refreshSessions, refreshProfile } = useApp();
  const { actor } = useActor();
  const [seconds, setSeconds] = useState(DEFAULT_DURATION);
  const [running, setRunning] = useState(false);
  const [justEarned, setJustEarned] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            void completeSession();
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

  const completeSession = async () => {
    if (!actor) return;
    const xpEarned = 50n;
    const durationMinutes = BigInt(Math.round(DEFAULT_DURATION / 60));
    try {
      await actor.addFocusSession(durationMinutes, xpEarned);
      if (profile) {
        const updated = {
          ...profile,
          xp: profile.xp + xpEarned,
          lastActive: BigInt(Date.now()),
        };
        await actor.saveCallerUserProfile(updated);
      }
      await Promise.all([refreshSessions(), refreshProfile()]);
      setJustEarned(Number(xpEarned));
      toast.success(`Focus session complete! +${xpEarned} XP 🎉`);
      setTimeout(() => setJustEarned(0), 3000);
    } catch {
      toast.error("Failed to save session");
    }
  };

  const reset = () => {
    setRunning(false);
    setSeconds(DEFAULT_DURATION);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((DEFAULT_DURATION - seconds) / DEFAULT_DURATION) * 100;

  const totalMinutes = focusSessions.reduce(
    (acc, s) => acc + Number(s.durationMinutes),
    0,
  );
  const totalXpFromFocus = focusSessions.reduce(
    (acc, s) => acc + Number(s.xpEarned),
    0,
  );

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">
            Focus <span className="gradient-text">Mode</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            25-minute Pomodoro sessions. Earn XP for every completed session.
          </p>
        </div>

        {/* Timer circle */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="relative w-52 h-52 sm:w-64 sm:h-64">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="oklch(0.22 0.028 240)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="oklch(0.58 0.22 278)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-4xl sm:text-5xl text-foreground">
                {String(minutes).padStart(2, "0")}:
                {String(secs).padStart(2, "0")}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                {running ? "Stay focused..." : "Ready to grind"}
              </span>
              <AnimatePresence>
                {justEarned > 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-primary font-bold text-sm mt-1"
                  >
                    +{justEarned} XP!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-10">
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            data-ocid="focus.button"
            className="w-12 h-12 rounded-full border-border"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            onClick={() => setRunning((r) => !r)}
            data-ocid="focus.primary_button"
            className="w-32 h-12 rounded-full gradient-btn text-background font-bold glow-cyan"
          >
            {running ? (
              <>
                <Pause className="w-5 h-5 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" /> Start
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {
              label: "Sessions",
              value: focusSessions.length,
              icon: Clock,
              color: "text-primary",
            },
            {
              label: "Total Minutes",
              value: totalMinutes,
              icon: Clock,
              color: "text-accent",
            },
            {
              label: "XP Earned",
              value: totalXpFromFocus,
              icon: Zap,
              color: "text-yellow-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-surface rounded-xl p-3 sm:p-4 text-center"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="card-surface rounded-xl p-4 sm:p-6">
          <h2 className="font-semibold mb-4">Recent Sessions</h2>
          {focusSessions.length === 0 ? (
            <div className="text-center py-8" data-ocid="focus.empty_state">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start your first focus session!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...focusSessions]
                .reverse()
                .slice(0, 10)
                .map((s, idx) => (
                  <div
                    key={String(s.completedAt)}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    data-ocid={`focus.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {Number(s.durationMinutes)}m session
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(s.completedAt)).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0 shrink-0">
                      <Zap className="w-3 h-3 mr-1" />+{Number(s.xpEarned)} XP
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
