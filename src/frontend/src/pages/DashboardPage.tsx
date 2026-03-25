import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, CheckSquare, Flame, Plus, Target, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { type Task, currentUser, defaultTasks } from "../data/mockData";

const TASKS_KEY = "grind_tasks";

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const todayTasks = tasks.filter((t) => t.dueDate === "2026-03-25");
  const completedToday = todayTasks.filter((t) => t.completed).length;

  const radarData = Object.entries(currentUser.radarScores).map(
    ([subject, A]) => ({ subject, A, fullMark: 100 }),
  );

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: "Work",
      priority: "Medium",
      dueDate: "2026-03-25",
      completed: false,
      xp: 30,
    };
    setTasks((prev) => [...prev, task]);
    setNewTaskTitle("");
    toast.success("Task added! +30 XP on completion");
  };

  const stats = [
    {
      label: "Total XP",
      value: currentUser.xp.toLocaleString(),
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Level",
      value: currentUser.level.toString(),
      icon: Target,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Streak",
      value: `${currentUser.streak}d`,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Tasks Today",
      value: `${completedToday}/${todayTasks.length}`,
      icon: CheckSquare,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  const xpProgress =
    ((currentUser.xp - 4000) / (currentUser.xpToNext - 4000)) * 100;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl">
              Welcome back,{" "}
              <span className="gradient-text">
                {currentUser.name.split(" ")[0]}
              </span>{" "}
              👋
            </h1>
            <p className="text-muted-foreground mt-1">
              You're on a {currentUser.streak}-day streak. Keep grinding!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 card-surface rounded-xl">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-orange-400">
              {currentUser.streak}
            </span>
            <span className="text-muted-foreground text-sm">day streak</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-surface rounded-xl p-4"
            >
              <div
                className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`font-display font-bold text-2xl ${s.color}`}>
                {s.value}
              </div>
              <div className="text-muted-foreground text-xs mt-0.5">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* XP Progress bar */}
        <div className="card-surface rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Level {currentUser.level} → {currentUser.level + 1}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentUser.xp.toLocaleString()} /{" "}
              {currentUser.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar chart */}
          <div className="card-surface rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Performance Radar
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.22 0.028 240)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "oklch(0.68 0.025 240)", fontSize: 12 }}
                />
                <Radar
                  name="You"
                  dataKey="A"
                  stroke="oklch(0.82 0.12 196)"
                  fill="oklch(0.82 0.12 196)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent tasks */}
          <div className="card-surface rounded-2xl p-6 flex flex-col">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" /> Today's Tasks
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-60">
              {todayTasks.map((task, i) => (
                <div
                  key={task.id}
                  data-ocid={`todo.item.${i + 1}`}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    task.completed ? "opacity-60" : "hover:bg-muted/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    data-ocid={`todo.checkbox.${i + 1}`}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      task.completed
                        ? "bg-primary border-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {task.completed && (
                      <Check className="w-3 h-3 text-background" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </p>
                  </div>
                  <Badge
                    className="text-xs border-0"
                    style={{
                      background:
                        task.category === "Work"
                          ? "oklch(0.58 0.22 278 / 0.2)"
                          : task.category === "Health"
                            ? "oklch(0.82 0.18 149 / 0.2)"
                            : task.category === "Learning"
                              ? "oklch(0.82 0.12 196 / 0.2)"
                              : "oklch(0.78 0.16 85 / 0.2)",
                      color:
                        task.category === "Work"
                          ? "oklch(0.58 0.22 278)"
                          : task.category === "Health"
                            ? "oklch(0.82 0.18 149)"
                            : task.category === "Learning"
                              ? "oklch(0.82 0.12 196)"
                              : "oklch(0.78 0.16 85)",
                    }}
                  >
                    {task.category}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a quick task..."
                data-ocid="todo.input"
                className="flex-1"
              />
              <Button
                onClick={addTask}
                data-ocid="todo.add_button"
                size="sm"
                className="gradient-btn text-background border-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
