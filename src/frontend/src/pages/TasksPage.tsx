import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Filter, Flame, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, Priority, useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";

const CATEGORIES = [
  "All",
  "work",
  "health",
  "learning",
  "social",
  "personal",
] as const;
type CategoryFilter = (typeof CATEGORIES)[number];
const PRIORITIES = ["All", "high", "medium", "low"] as const;
type PriorityFilter = (typeof PRIORITIES)[number];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  work: { bg: "oklch(0.58 0.22 278 / 0.2)", text: "oklch(0.58 0.22 278)" },
  health: { bg: "oklch(0.82 0.18 149 / 0.2)", text: "oklch(0.82 0.18 149)" },
  learning: { bg: "oklch(0.82 0.12 196 / 0.2)", text: "oklch(0.82 0.12 196)" },
  social: { bg: "oklch(0.78 0.16 85 / 0.2)", text: "oklch(0.78 0.16 85)" },
  personal: { bg: "oklch(0.62 0.22 27 / 0.2)", text: "oklch(0.62 0.22 27)" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

export default function TasksPage() {
  const { tasks, isLoading, refreshTasks, refreshProfile } = useApp();
  const { actor } = useActor();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "work" as keyof typeof Category,
    priority: "medium" as keyof typeof Priority,
    dueDate: new Date().toISOString().split("T")[0],
    xpReward: "30",
  });

  const filtered = tasks.filter((t) => {
    if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    return true;
  });

  const addTask = async () => {
    if (!form.title.trim() || !actor) return;
    setSubmitting(true);
    try {
      const dueMs = BigInt(new Date(form.dueDate).getTime());
      await actor.addTask(
        form.title.trim(),
        Category[form.category],
        Priority[form.priority],
        dueMs,
        BigInt(Number(form.xpReward) || 30),
      );
      await refreshTasks();
      setDialogOpen(false);
      setForm({
        title: "",
        category: "work",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
        xpReward: "30",
      });
      toast.success(`Task added! +${form.xpReward || 30} XP on completion`);
    } catch {
      toast.error("Failed to add task");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = async (index: number, completed: boolean) => {
    if (!actor) return;
    try {
      await actor.updateTask(BigInt(index), !completed);
      await Promise.all([refreshTasks(), refreshProfile()]);
      if (!completed) toast.success("Task completed! XP earned 🎉");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (index: number) => {
    if (!actor) return;
    setDeletingIdx(index);
    try {
      await actor.deleteTask(BigInt(index));
      await refreshTasks();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeletingIdx(null);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1">
              My <span className="gradient-text">Tasks</span>
            </h1>
            <p className="text-muted-foreground">
              {tasks.length} tasks total ·{" "}
              {tasks.filter((t) => t.completed).length} completed
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gradient-btn text-background font-semibold"
                data-ocid="tasks.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border"
              data-ocid="tasks.dialog"
            >
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-sm mb-1.5 block">Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="What do you need to grind?"
                    data-ocid="tasks.input"
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-1.5 block">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          category: v as keyof typeof Category,
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="tasks.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(Category).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Priority</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          priority: v as keyof typeof Priority,
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="tasks.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(Priority).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-1.5 block">Due Date</Label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dueDate: e.target.value }))
                      }
                      data-ocid="tasks.input"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">XP Reward</Label>
                    <Input
                      type="number"
                      value={form.xpReward}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, xpReward: e.target.value }))
                      }
                      min="5"
                      max="500"
                      data-ocid="tasks.input"
                    />
                  </div>
                </div>
                <Button
                  onClick={addTask}
                  disabled={submitting || !form.title.trim()}
                  className="w-full gradient-btn text-background font-semibold"
                  data-ocid="tasks.submit_button"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  data-ocid="tasks.tab"
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    categoryFilter === c
                      ? "bg-primary text-background"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                data-ocid="tasks.tab"
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  priorityFilter === p
                    ? "bg-accent text-background"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="space-y-3" data-ocid="tasks.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" data-ocid="tasks.empty_state">
            <Flame className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No tasks yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first task and start earning XP!
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gradient-btn text-background font-semibold"
              data-ocid="tasks.primary_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Task
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {filtered.map((task, idx) => {
                const globalIdx = tasks.findIndex((t) => t === task);
                const catColors =
                  CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.work;
                return (
                  <motion.div
                    key={`${task.title}-${String(task.dueDate)}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="card-surface rounded-xl p-4 flex items-center gap-4 group"
                    data-ocid={`tasks.item.${idx + 1}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(globalIdx, task.completed)}
                      data-ocid={`tasks.checkbox.${idx + 1}`}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        task.completed
                          ? "bg-green-500 border-green-500"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(task.dueDate)).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="text-xs border-0"
                        style={{
                          background: catColors.bg,
                          color: catColors.text,
                        }}
                      >
                        {task.category}
                      </Badge>
                      <span
                        className={`text-xs font-medium ${
                          PRIORITY_COLORS[task.priority] ??
                          "text-muted-foreground"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        +{Number(task.xpReward)}XP
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteTask(globalIdx)}
                        disabled={deletingIdx === globalIdx}
                        data-ocid={`tasks.delete_button.${idx + 1}`}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        {deletingIdx === globalIdx ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
