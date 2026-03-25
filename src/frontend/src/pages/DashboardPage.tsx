import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Target,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import type { Page } from "../App";
import { Category, Priority, useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  work: { bg: "oklch(0.58 0.22 278 / 0.2)", text: "oklch(0.58 0.22 278)" },
  health: { bg: "oklch(0.82 0.18 149 / 0.2)", text: "oklch(0.82 0.18 149)" },
  learning: { bg: "oklch(0.82 0.12 196 / 0.2)", text: "oklch(0.82 0.12 196)" },
  social: { bg: "oklch(0.78 0.16 85 / 0.2)", text: "oklch(0.78 0.16 85)" },
  personal: { bg: "oklch(0.62 0.22 27 / 0.2)", text: "oklch(0.62 0.22 27)" },
};

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getWeekDays(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(
    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7,
  );
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCompletionDot(total: number, done: number) {
  if (total === 0) return { color: "#4b5563", label: "No tasks" };
  const pct = (done / total) * 100;
  if (pct >= 90) return { color: "#22c55e", label: "90%+" };
  if (pct >= 70) return { color: "#86efac", label: "70-89%" };
  if (pct >= 50) return { color: "#eab308", label: "50-69%" };
  if (pct >= 30) return { color: "#f97316", label: "30-49%" };
  return { color: "#ef4444", label: "<30%" };
}

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { profile, tasks, isLoading, refreshTasks, refreshProfile } = useApp();
  const { actor } = useActor();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const level = profile ? Number(profile.level) : 1;
  const xp = profile ? Number(profile.xp) : 0;
  const streak = profile ? Number(profile.streak) : 0;
  const username = profile?.username ?? "Grinder";
  const xpToNext = level * 1000;
  const xpProgress = Math.min((xp / xpToNext) * 100, 100);

  const radarData = profile
    ? Object.entries(profile.radarScores).map(([subject, A]) => ({
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        A: Number(A),
        fullMark: 100,
      }))
    : [];

  const weekDays = getWeekDays(weekOffset);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const weekLabel = `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}`;

  const today = new Date();

  // Selected day tasks
  const dayStart = new Date(selectedDate).setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate).setHours(23, 59, 59, 999);
  const dayTasks = tasks.filter((t) => {
    const due = Number(t.dueDate);
    return due >= dayStart && due <= dayEnd;
  });

  // Today stats (for stat card)
  const todayStart = new Date(today).setHours(0, 0, 0, 0);
  const todayEnd = new Date(today).setHours(23, 59, 59, 999);
  const todayTasks = tasks.filter((t) => {
    const due = Number(t.dueDate);
    return due >= todayStart && due <= todayEnd;
  });
  const completedToday = todayTasks.filter((t) => t.completed).length;

  const taskHeaderLabel = isSameDay(selectedDate, today)
    ? "Today's Tasks"
    : `Tasks for ${DAY_NAMES[(weekDays.findIndex((d) => isSameDay(d, selectedDate)) + 7) % 7]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  const addTask = async () => {
    if (!newTaskTitle.trim() || !actor) return;
    setAdding(true);
    try {
      const dueMs = BigInt(new Date(selectedDate).setHours(23, 59, 59, 999));
      await actor.addTask(
        newTaskTitle.trim(),
        Category.work,
        Priority.medium,
        dueMs,
        30n,
      );
      await refreshTasks();
      setNewTaskTitle("");
      toast.success("Task added!");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (id: bigint, completed: boolean) => {
    if (!actor) return;
    try {
      await actor.updateTask(id, !completed);
      await Promise.all([refreshTasks(), refreshProfile()]);
    } catch {
      toast.error("Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <div
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8"
        data-ocid="dashboard.loading_state"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1">
            Welcome back, <span className="gradient-text">{username}</span>! 👊
          </h1>
          <p className="text-muted-foreground text-sm">
            Keep the streak alive. Here's your overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Level", value: level, icon: Zap, color: "text-primary" },
            {
              label: "Total XP",
              value: xp.toLocaleString(),
              icon: Target,
              color: "text-accent",
            },
            {
              label: "Streak",
              value: `${streak} days`,
              icon: Flame,
              color: "text-orange-400",
            },
            {
              label: "Tasks Today",
              value: `${completedToday}/${todayTasks.length}`,
              icon: CheckSquare,
              color: "text-green-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-surface rounded-xl p-4 sm:p-5"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        <div className="card-surface rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Level {level} Progress</span>
            <span className="text-xs text-muted-foreground">
              {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {xpToNext - xp} XP to Level {level + 1}
          </p>
        </div>

        {/* Weekly Overview */}
        <div
          className="card-surface rounded-xl p-4 sm:p-6 mb-6"
          data-ocid="dashboard.panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold">Weekly Overview</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset((w) => w - 1)}
                data-ocid="dashboard.pagination_prev"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWeekOffset(0);
                  setSelectedDate(new Date());
                }}
                data-ocid="dashboard.button"
                className="text-xs h-7 px-3 border-border"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset((w) => w + 1)}
                data-ocid="dashboard.pagination_next"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {weekLabel}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground sm:hidden block mb-3">
            {weekLabel}
          </span>

          {/* Day cards */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {weekDays.map((day, idx) => {
              const dayS = new Date(day).setHours(0, 0, 0, 0);
              const dayE = new Date(day).setHours(23, 59, 59, 999);
              const dTasks = tasks.filter((t) => {
                const due = Number(t.dueDate);
                return due >= dayS && due <= dayE;
              });
              const dDone = dTasks.filter((t) => t.completed).length;
              const dot = getCompletionDot(dTasks.length, dDone);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={day.toISOString().slice(0, 10)}
                  type="button"
                  onClick={() => setSelectedDate(new Date(day))}
                  data-ocid={`dashboard.item.${idx + 1}`}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 rounded-xl p-2.5 sm:p-3 min-w-[60px] sm:min-w-[72px] border transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/10 text-foreground"
                      : "border-border/40 bg-muted/10 text-muted-foreground hover:border-border hover:bg-muted/20"
                  }`}
                >
                  <span className="text-[10px] font-semibold tracking-wider">
                    {DAY_NAMES[idx]}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-bold leading-none ${isSelected ? "text-foreground" : ""}`}
                  >
                    {day.getDate()}
                  </span>
                  {isToday && (
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                  )}
                  <span
                    className="w-2 h-2 rounded-full mt-0.5"
                    style={{ background: dot.color }}
                  />
                  <span className="text-[9px] sm:text-[10px] text-center leading-tight">
                    {dTasks.length === 0
                      ? "No tasks"
                      : `${dDone}/${dTasks.length}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-border/40">
            {[
              { color: "#22c55e", label: "90%+" },
              { color: "#86efac", label: "70-89%" },
              { color: "#eab308", label: "50-69%" },
              { color: "#f97316", label: "30-49%" },
              { color: "#ef4444", label: "<30%" },
              { color: "#4b5563", label: "No tasks" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Day Tasks */}
          <div className="card-surface rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm sm:text-base">
                {taskHeaderLabel}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigate("tasks")}
                data-ocid="dashboard.link"
                className="text-primary hover:bg-primary/10 text-xs"
              >
                View All
              </Button>
            </div>

            {/* Quick add */}
            <div className="flex gap-2 mb-4">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Quick add task..."
                data-ocid="dashboard.input"
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <Button
                size="icon"
                onClick={addTask}
                disabled={adding || !newTaskTitle.trim()}
                data-ocid="dashboard.primary_button"
                className="gradient-btn text-background shrink-0 min-w-[44px] min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {dayTasks.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="dashboard.empty_state"
              >
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tasks for this day yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Add one above to start grinding!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {dayTasks.map((task, idx) => {
                  const catColors =
                    CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.work;
                  return (
                    <motion.div
                      key={String(task.id)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 group"
                      data-ocid={`dashboard.item.${idx + 1}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id, task.completed)}
                        data-ocid={`dashboard.checkbox.${idx + 1}`}
                        className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          task.completed
                            ? "bg-green-500 border-green-500"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {task.completed && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm min-w-0 truncate ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        className="text-xs border-0 shrink-0"
                        style={{
                          background: catColors.bg,
                          color: catColors.text,
                        }}
                      >
                        {task.category}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Radar Chart */}
          <div className="card-surface rounded-xl p-4 sm:p-6">
            <h2 className="font-semibold mb-4">Life Balance Radar</h2>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
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
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Complete tasks to fill your radar!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
