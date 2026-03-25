import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CheckSquare, Flame, Plus, Target, Zap } from "lucide-react";
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

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { profile, tasks, isLoading, refreshTasks, refreshProfile } = useApp();
  const { actor } = useActor();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [adding, setAdding] = useState(false);

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

  const todayMs = Date.now();
  const todayStart = new Date(todayMs).setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayMs).setHours(23, 59, 59, 999);
  const todayTasks = tasks.filter((t) => {
    const due = Number(t.dueDate);
    return due >= todayStart && due <= todayEnd;
  });
  const completedToday = todayTasks.filter((t) => t.completed).length;

  const addTask = async () => {
    if (!newTaskTitle.trim() || !actor) return;
    setAdding(true);
    try {
      const dueMs = BigInt(new Date().setHours(23, 59, 59, 999));
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

  const toggleTask = async (index: number, completed: boolean) => {
    if (!actor) return;
    try {
      await actor.updateTask(BigInt(index), !completed);
      await Promise.all([refreshTasks(), refreshProfile()]);
    } catch {
      toast.error("Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <div
        className="max-w-[1200px] mx-auto px-6 py-10"
        data-ocid="dashboard.loading_state"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-1">
            Welcome back, <span className="gradient-text">{username}</span>! 👊
          </h1>
          <p className="text-muted-foreground">
            Keep the streak alive. Here's your overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <div key={stat.label} className="card-surface rounded-xl p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        <div className="card-surface rounded-xl p-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="card-surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Today's Tasks</h2>
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
                className="gradient-btn text-background shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {todayTasks.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="dashboard.empty_state"
              >
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tasks for today yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Add one above to start grinding!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {todayTasks.map((task, idx) => {
                  const globalIdx = tasks.findIndex((t) => t === task);
                  const catColors =
                    CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.work;
                  return (
                    <motion.div
                      key={`${task.title}-${String(task.dueDate)}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 group"
                      data-ocid={`dashboard.item.${idx + 1}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(globalIdx, task.completed)}
                        data-ocid={`dashboard.checkbox.${idx + 1}`}
                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
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
                        className={`flex-1 text-sm ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        className="text-xs border-0"
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
          <div className="card-surface rounded-xl p-6">
            <h2 className="font-semibold mb-4">Life Balance Radar</h2>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
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
