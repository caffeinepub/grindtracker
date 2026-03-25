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
import { achievements, weeklyProductivity } from "../data/mockData";

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.16 0.022 240)",
    border: "1px solid oklch(0.22 0.028 240)",
    borderRadius: "8px",
  },
  labelStyle: { color: "oklch(0.94 0.012 240)" },
};

export default function InsightsPage() {
  const totalTasks = weeklyProductivity.reduce((s, d) => s + d.tasks, 0);
  const totalFocus = weeklyProductivity.reduce((s, d) => s + d.focusTime, 0);
  const totalXp = weeklyProductivity.reduce((s, d) => s + d.xp, 0);
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
          7-day performance breakdown and achievement progress.
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
              color: "text-green-400",
            },
            {
              label: "Achievements",
              value: `${unlockedCount}/${achievements.length}`,
              icon: Award,
              color: "text-yellow-400",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card-surface rounded-xl p-4"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className={`font-display font-bold text-2xl ${s.color}`}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tasks per day */}
          <div className="card-surface rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Tasks Per Day
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyProductivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.22 0.028 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  itemStyle={{ color: "oklch(0.82 0.12 196)" }}
                />
                <Bar
                  dataKey="tasks"
                  fill="oklch(0.82 0.12 196)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Focus time */}
          <div className="card-surface rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Focus Time (minutes)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyProductivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.22 0.028 240)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  itemStyle={{ color: "oklch(0.58 0.22 278)" }}
                />
                <Line
                  type="monotone"
                  dataKey="focusTime"
                  stroke="oklch(0.58 0.22 278)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.58 0.22 278)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* XP gained */}
          <div className="card-surface rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" /> XP Gained Per Day
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyProductivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.22 0.028 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  itemStyle={{ color: "oklch(0.82 0.18 149)" }}
                />
                <Bar
                  dataKey="xp"
                  fill="oklch(0.82 0.18 149)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-surface rounded-2xl p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Achievements
            <Badge className="bg-yellow-400/20 text-yellow-400 border-0 ml-1">
              {unlockedCount}/{achievements.length}
            </Badge>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`insights.item.${i + 1}`}
                className={`rounded-xl p-4 text-center transition-all ${
                  ach.unlocked
                    ? "card-surface-light border border-primary/20"
                    : "card-surface opacity-50 grayscale"
                }`}
              >
                <div className="text-3xl mb-2">{ach.icon}</div>
                <div className="font-semibold text-sm">{ach.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {ach.description}
                </div>
                {ach.unlocked && (
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-0 text-xs">
                    Unlocked
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
