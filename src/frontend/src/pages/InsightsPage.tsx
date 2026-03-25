import { Badge } from "@/components/ui/badge";
import { Award, Clock, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.16 0.022 240)",
    border: "1px solid oklch(0.22 0.028 240)",
    borderRadius: "8px",
  },
  labelStyle: { color: "oklch(0.94 0.012 240)" },
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InsightsPage() {
  const { tasks, focusSessions } = useApp();

  // Build last-7-days productivity data from real data
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dayStart = new Date(date).setHours(0, 0, 0, 0);
    const dayEnd = new Date(date).setHours(23, 59, 59, 999);

    const dayTasks = tasks.filter((t) => {
      const due = Number(t.dueDate);
      return due >= dayStart && due <= dayEnd && t.completed;
    }).length;

    const dayFocusMinutes = focusSessions
      .filter((s) => {
        const at = Number(s.completedAt);
        return at >= dayStart && at <= dayEnd;
      })
      .reduce((acc, s) => acc + Number(s.durationMinutes), 0);

    const dayXp = focusSessions
      .filter((s) => {
        const at = Number(s.completedAt);
        return at >= dayStart && at <= dayEnd;
      })
      .reduce((acc, s) => acc + Number(s.xpEarned), 0);

    return {
      day: DAY_LABELS[date.getDay()],
      tasks: dayTasks,
      focusTime: dayFocusMinutes,
      xp: dayXp,
    };
  });

  const totalTasks = weekData.reduce((s, d) => s + d.tasks, 0);
  const totalFocus = weekData.reduce((s, d) => s + d.focusTime, 0);
  const totalXp = weekData.reduce((s, d) => s + d.xp, 0);

  // Achievements derived from real data
  const allTasksCount = tasks.filter((t) => t.completed).length;
  const sessionsCount = focusSessions.length;
  const achievements = [
    {
      title: "First Step",
      desc: "Complete your first task",
      icon: "⚡",
      unlocked: allTasksCount >= 1,
      required: 1,
      current: allTasksCount,
    },
    {
      title: "Grinder",
      desc: "Complete 10 tasks",
      icon: "🔥",
      unlocked: allTasksCount >= 10,
      required: 10,
      current: allTasksCount,
    },
    {
      title: "Century Club",
      desc: "Complete 100 tasks",
      icon: "💯",
      unlocked: allTasksCount >= 100,
      required: 100,
      current: allTasksCount,
    },
    {
      title: "Focus Beginner",
      desc: "Complete your first focus session",
      icon: "🎯",
      unlocked: sessionsCount >= 1,
      required: 1,
      current: sessionsCount,
    },
    {
      title: "Deep Work",
      desc: "Complete 10 focus sessions",
      icon: "🧠",
      unlocked: sessionsCount >= 10,
      required: 10,
      current: sessionsCount,
    },
    {
      title: "Focused Mind",
      desc: "Complete 50 focus sessions",
      icon: "🏆",
      unlocked: sessionsCount >= 50,
      required: 50,
      current: sessionsCount,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-bold text-3xl mb-2">
          Your <span className="gradient-text">Insights</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          7-day performance breakdown based on your real activity.
        </p>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Tasks Done",
              value: totalTasks,
              icon: TrendingUp,
              color: "text-primary",
            },
            {
              label: "Focus Minutes",
              value: `${totalFocus}m`,
              icon: Clock,
              color: "text-accent",
            },
            {
              label: "XP Earned",
              value: totalXp.toLocaleString(),
              icon: Zap,
              color: "text-yellow-400",
            },
            {
              label: "Achievements",
              value: `${unlockedCount}/${achievements.length}`,
              icon: Award,
              color: "text-purple-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="card-surface rounded-xl p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tasks Chart */}
          <div className="card-surface rounded-xl p-6">
            <h2 className="font-semibold mb-4">Daily Tasks Completed</h2>
            {totalTasks === 0 ? (
              <div
                className="flex items-center justify-center h-48 text-muted-foreground text-sm"
                data-ocid="insights.empty_state"
              >
                Complete tasks to see your progress here!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.028 240)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "oklch(0.6 0.02 240)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.6 0.02 240)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar
                    dataKey="tasks"
                    fill="oklch(0.58 0.22 278)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Focus Chart */}
          <div className="card-surface rounded-xl p-6">
            <h2 className="font-semibold mb-4">Focus Minutes / Day</h2>
            {totalFocus === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Start focus sessions to see your data!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weekData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.028 240)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "oklch(0.6 0.02 240)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.6 0.02 240)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="focusTime"
                    stroke="oklch(0.82 0.14 196)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.82 0.14 196)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold">Achievements</h2>
            <Badge className="bg-purple-400/10 text-purple-400 border-0 text-xs">
              {unlockedCount}/{achievements.length} Unlocked
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((a, idx) => (
              <div
                key={a.title}
                data-ocid={`insights.item.${idx + 1}`}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  a.unlocked
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/30 bg-muted/10 opacity-50"
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.desc}
                  </p>
                  {!a.unlocked && (
                    <p className="text-xs text-primary mt-0.5">
                      {a.current}/{a.required}
                    </p>
                  )}
                </div>
                {a.unlocked && (
                  <Badge className="bg-primary/20 text-primary border-0 text-xs shrink-0">
                    ✓
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
