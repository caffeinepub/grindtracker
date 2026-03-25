import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Flame,
  Loader2,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Page } from "../App";
import Footer from "../components/Footer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// Static demo data for decorative radar chart — NOT tied to any user
const demoRadarData = [
  { subject: "Work", A: 80, fullMark: 100 },
  { subject: "Health", A: 65, fullMark: 100 },
  { subject: "Learning", A: 88, fullMark: 100 },
  { subject: "Social", A: 55, fullMark: 100 },
  { subject: "Personal", A: 72, fullMark: 100 },
  { subject: "Focus", A: 76, fullMark: 100 },
];

// Generic leaderboard preview — no "You" highlight
const demoLeaderboard = [
  { rank: 1, name: "Shadow Wolf", xp: 12400, streak: 21, badge: "🥇" },
  { rank: 2, name: "Apex Grinder", xp: 11200, streak: 18, badge: "🥈" },
  { rank: 3, name: "Iron Mind", xp: 10800, streak: 15, badge: "🥉" },
  { rank: 4, name: "DawnRiser", xp: 9300, streak: 12, badge: "4" },
  { rank: 5, name: "CodeFury", xp: 8700, streak: 9, badge: "5" },
];

const features = [
  {
    icon: Target,
    title: "Smart Task Management",
    desc: "Categorize, prioritize, and track tasks across every life domain with intelligent XP rewards.",
    color: "text-primary",
  },
  {
    icon: Flame,
    title: "Streak System",
    desc: "Build unstoppable momentum with daily streaks that multiply your XP earnings over time.",
    color: "text-orange-400",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    desc: "Compete with a global community. Rise the ranks and claim your crown.",
    color: "text-yellow-400",
  },
  {
    icon: Timer,
    title: "Focus Mode",
    desc: "Pomodoro-powered deep work sessions that maximize productivity and reward your focus.",
    color: "text-accent",
  },
];

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({
  onNavigate: _onNavigate,
}: LandingPageProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center glow-cyan">
                <Zap className="w-5 h-5 text-background" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                <span className="gradient-text">GRIND</span>
                <span className="text-foreground">TRACKER</span>
              </span>
            </div>

            <h1 className="font-display font-bold text-5xl lg:text-6xl leading-tight mb-6">
              Level Up <span className="gradient-text">Every</span>
              <br />
              Aspect of <span className="gradient-text">Your Life</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
              GrindTracker turns your daily habits, tasks, and focus sessions
              into a gamified journey. Earn XP, build streaks, and compete on
              the global leaderboard.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="landing.primary_button"
                className="gradient-btn text-background font-bold text-base px-8 py-6 glow-cyan"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Start Grinding — Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              🔐 Powered by Internet Identity — no passwords, no data sold.
            </p>

            <div className="flex items-center gap-6 mt-8">
              {[
                { icon: Users, label: "1,200+ Active Grinders" },
                { icon: Star, label: "4.9 / 5 Rating" },
                { icon: Trophy, label: "Free to Use" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — decorative radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="card-surface rounded-2xl p-6 glow-cyan">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center">
                  <Zap className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="font-bold text-sm">Sample Grinder Profile</p>
                  <p className="text-xs text-muted-foreground">
                    Level 12 · 4,820 XP
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={demoRadarData}>
                  <PolarGrid stroke="oklch(0.3 0.03 240)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "oklch(0.7 0.02 240)", fontSize: 11 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="oklch(0.58 0.22 278)"
                    fill="oklch(0.58 0.22 278)"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.022 240)",
                      border: "1px solid oklch(0.22 0.028 240)",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-3xl text-center mb-2">
            Everything You Need to{" "}
            <span className="gradient-text">Grind Smarter</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            One platform to track it all.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="card-surface rounded-xl p-6"
              >
                <div className={`${f.color} mb-4`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Leaderboard preview */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-display font-bold text-3xl mb-4">
              Compete. <span className="gradient-text">Rise.</span> Dominate.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The global leaderboard tracks real XP earned through completed
              tasks and focus sessions. Every action counts. Sign in and claim
              your spot.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="landing.secondary_button"
              className="gradient-btn text-background font-bold"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Join the Leaderboard"
              )}
            </Button>
          </div>
          <div className="card-surface rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Global Rankings</span>
            </div>
            <div className="space-y-3">
              {demoLeaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20"
                >
                  <span className="text-lg w-8 text-center">{entry.badge}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.streak}🔥 streak
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {entry.xp.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="card-surface rounded-2xl p-12 text-center glow-cyan"
        >
          <h2 className="font-display font-bold text-4xl mb-4">
            Ready to Start <span className="gradient-text">Grinding?</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign in with Internet Identity — no email required. Your account
            syncs across all devices automatically.
          </p>
          <Button
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="landing.cta_button"
            className="gradient-btn text-background font-bold text-base px-10 py-6 glow-cyan"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Sign In &amp; Start Grinding
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Free forever · Syncs across devices · Built on the Internet Computer
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
