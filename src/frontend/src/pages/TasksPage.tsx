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
import { Check, Filter, Flame, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Task, currentUser, defaultTasks } from "../data/mockData";

const TASKS_KEY = "grind_tasks";
const CATEGORIES = [
  "All",
  "Work",
  "Health",
  "Learning",
  "Social",
  "Personal",
] as const;
type CategoryFilter = (typeof CATEGORIES)[number];
const PRIORITIES = ["All", "High", "Medium", "Low"] as const;
type PriorityFilter = (typeof PRIORITIES)[number];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Work: { bg: "oklch(0.58 0.22 278 / 0.2)", text: "oklch(0.58 0.22 278)" },
  Health: { bg: "oklch(0.82 0.18 149 / 0.2)", text: "oklch(0.82 0.18 149)" },
  Learning: { bg: "oklch(0.82 0.12 196 / 0.2)", text: "oklch(0.82 0.12 196)" },
  Social: { bg: "oklch(0.78 0.16 85 / 0.2)", text: "oklch(0.78 0.16 85)" },
  Personal: { bg: "oklch(0.62 0.22 27 / 0.2)", text: "oklch(0.62 0.22 27)" },
};

const PRIORITY_COLORS: Record<string, string> = {
  High: "text-red-400",
  Medium: "text-yellow-400",
  Low: "text-green-400",
};

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [catFilter, setCatFilter] = useState<CategoryFilter>("All");
  const [priFilter, setPriFilter] = useState<PriorityFilter>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Work" as Task["category"],
    priority: "Medium" as Task["priority"],
    dueDate: "2026-03-26",
  });

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const filtered = tasks.filter(
    (t) =>
      (catFilter === "All" || t.category === catFilter) &&
      (priFilter === "All" || t.priority === priFilter),
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.completed) toast.success(`+${t.xp} XP earned! 🎉`);
        return { ...t, completed: !t.completed };
      }),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task removed");
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      xp:
        newTask.priority === "High"
          ? 60
          : newTask.priority === "Medium"
            ? 40
            : 20,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({
      title: "",
      category: "Work",
      priority: "Medium",
      dueDate: "2026-03-26",
    });
    setDialogOpen(false);
    toast.success("Task added!");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1">
              Task <span className="gradient-text">Arsenal</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {completedCount}/{tasks.length} completed
              </span>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-semibold">
                  {currentUser.streak}-day streak
                </span>
              </div>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="tasks.open_modal_button"
                className="gradient-btn text-background border-0"
              >
                <Plus className="w-4 h-4 mr-1" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="tasks.dialog"
              className="card-surface border-border"
            >
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, title: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="What do you need to do?"
                    data-ocid="tasks.input"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(v) =>
                        setNewTask((p) => ({
                          ...p,
                          category: v as Task["category"],
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="tasks.select" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Work",
                          "Health",
                          "Learning",
                          "Social",
                          "Personal",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) =>
                        setNewTask((p) => ({
                          ...p,
                          priority: v as Task["priority"],
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="tasks.select" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["High", "Medium", "Low"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, dueDate: e.target.value }))
                    }
                    data-ocid="tasks.input"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={addTask}
                  data-ocid="tasks.submit_button"
                  className="w-full gradient-btn text-background border-0"
                >
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCatFilter(cat)}
                data-ocid="tasks.tab"
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  catFilter === cat
                    ? "bg-primary text-background"
                    : "card-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 ml-2">
            {PRIORITIES.map((pri) => (
              <button
                type="button"
                key={pri}
                onClick={() => setPriFilter(pri)}
                data-ocid="tasks.tab"
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  priFilter === pri
                    ? "bg-accent text-accent-foreground"
                    : "card-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {pri}
              </button>
            ))}
          </div>
        </div>

        {/* Task grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((task, i) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                data-ocid={`tasks.item.${i + 1}`}
                className={`card-surface rounded-xl p-4 flex flex-col gap-3 ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    data-ocid={`tasks.checkbox.${i + 1}`}
                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
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
                      className={`font-medium text-sm leading-snug ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due {task.dueDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    data-ocid={`tasks.delete_button.${i + 1}`}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-xs border-0"
                    style={{
                      background: CATEGORY_COLORS[task.category]?.bg,
                      color: CATEGORY_COLORS[task.category]?.text,
                    }}
                  >
                    {task.category}
                  </Badge>
                  <span
                    className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    +{task.xp} XP
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div
            data-ocid="tasks.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <div className="w-12 h-12 mx-auto mb-3 opacity-30 rounded-full border-2 border-current flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p>
              No tasks match your filter. Try a different category or add a new
              task.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
