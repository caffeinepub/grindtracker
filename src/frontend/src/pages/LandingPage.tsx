import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Flame,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import Footer from "../components/Footer";
import {
  communityFeed,
  currentUser,
  leaderboardData,
  weeklyProductivity,
} from "../data/mockData";

const radarData = Object.entries(currentUser.radarScores).map(
  ([subject, A]) => ({ subject, A, fullMark: 100 }),
);

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
    desc: "Compete with friends and a global community. Rise the ranks and claim your crown.",
    color: "text-yellow-400",
  },
  {
    icon: Timer,
    title: "Focus Mode",
    desc: "Pomodoro-powered deep work sessions that maximize your productivity and reward your focus.",
    color: "text-accent",
  },
];

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1" /> Level Up Your Life
            </Badge>
            <h1 className="font-display font-extrabold text-5xl lg:text-6xl leading-tight uppercase mb-6">
              CRUSH YOUR
              <br />
              <span className="gradient-text">GOALS DAILY</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
              GrindTracker turns your daily habits into an epic progression
              system. Track tasks, compete on leaderboards, and level up your
              real life.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                data-ocid="hero.primary_button"
                className="gradient-btn px-8 py-3.5 rounded-full font-semibold text-background glow-cyan hover:scale-105 transition-transform flex items-center gap-2"
              >
                Start Grinding <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("leaderboard")}
                data-ocid="hero.secondary_button"
                className="px-8 py-3.5 rounded-full font-semibold border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> View Rankings
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mt-10">
              {[
                { value: "12K+", label: "Active Users" },
                { value: "2.4M", label: "Tasks Completed" },
                { value: "98%", label: "Satisfaction" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display font-bold text-2xl gradient-text">
                    {s.value}
                  </div>
                  <div className="text-muted-foreground text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="card-surface rounded-2xl p-8 w-full glow-cyan relative">
              <div className="absolute top-4 left-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Performance Radar
                </span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart
                  data={radarData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <PolarGrid stroke="oklch(0.22 0.028 240)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "oklch(0.68 0.025 240)",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <Radar
                    name="Alex"
                    dataKey="A"
                    stroke="oklch(0.82 0.12 196)"
                    fill="oklch(0.82 0.12 196)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {/* User rank pill */}
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full card-surface-light">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs gradient-btn text-background font-bold">
                      AC
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">
                    {currentUser.name}
                  </span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                    Rank #5
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-3xl uppercase tracking-widest text-foreground mb-3">
            FEATURES TO AMPLIFY YOUR{" "}
            <span className="gradient-text">GRIND</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to transform daily discipline into extraordinary
            results.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-surface rounded-xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color} bg-current/10`}
              >
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rise to the Top */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-bold text-3xl uppercase tracking-widest text-center mb-12"
        >
          RISE TO THE <span className="gradient-text">TOP</span>
        </motion.h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-surface rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Live Leaderboard
              </h3>
              <button
                type="button"
                onClick={() => onNavigate("leaderboard")}
                className="text-xs text-primary hover:underline"
                data-ocid="leaderboard.link"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {leaderboardData.slice(0, 5).map((user, idx) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                    user.isCurrentUser
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <span
                    className={`w-6 text-center font-bold text-sm ${
                      idx === 0
                        ? "text-yellow-400"
                        : idx === 1
                          ? "text-gray-400"
                          : idx === 2
                            ? "text-orange-400"
                            : "text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs gradient-btn text-background font-bold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm truncate">
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <Badge className="bg-primary/20 text-primary border-0 text-xs px-1">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lv.{user.level}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">
                      {user.xp.toLocaleString()} XP
                    </div>
                    <div className="text-xs text-orange-400">
                      🔥 {user.streak}d
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Focus timer demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-surface rounded-2xl p-6"
          >
            <h3 className="font-semibold flex items-center gap-2 mb-6">
              <Timer className="w-4 h-4 text-primary" /> Daily Focus
            </h3>
            {/* Circular timer */}
            <div className="flex justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 120 120"
                  aria-hidden="true"
                >
                  <title>Focus timer progress</title>
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="oklch(0.22 0.028 240)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="oklch(0.82 0.12 196)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * 0.35}`}
                    className="drop-shadow-[0_0_8px_oklch(0.82_0.12_196)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-3xl">16:15</span>
                  <span className="text-xs text-muted-foreground">
                    remaining
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                "Review quarterly goals",
                "Deep work: code architecture",
                "Learning session",
              ].map((task, i) => (
                <div key={task} className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      i < 2 ? "border-primary bg-primary/20" : "border-border"
                    }`}
                  >
                    {i < 2 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span
                    className={
                      i < 2 ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {task}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onNavigate("focus")}
              data-ocid="focus.primary_button"
              className="w-full mt-6 py-3 rounded-xl gradient-btn text-background font-semibold glow-cyan hover:scale-[1.02] transition-transform"
            >
              Start Focus Session
            </button>
          </motion.div>
        </div>
      </section>

      {/* Community + Insights */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-surface rounded-2xl p-6"
          >
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" /> Community Hub
            </h3>
            <div className="space-y-3">
              {communityFeed.map((post) => (
                <div key={post.id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs gradient-btn text-background font-bold">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{post.user}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        {post.action}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {post.time}
                      </span>
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs px-1.5">
                        +{post.xpGained} XP
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Insights mini chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card-surface rounded-2xl p-6"
          >
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-primary" /> Weekly Productivity
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyProductivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.22 0.028 240)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.16 0.022 240)",
                    border: "1px solid oklch(0.22 0.028 240)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "oklch(0.94 0.012 240)" }}
                  itemStyle={{ color: "oklch(0.82 0.12 196)" }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="oklch(0.82 0.12 196)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.82 0.12 196)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
