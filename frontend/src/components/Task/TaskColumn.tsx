import React from "react";
import { Plus, ListTodo, Clock, CheckCircle2 } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/services/task";

import TaskCard from "./TaskCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

export interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const columnConfigs: Record<
    TaskStatus,
    {
      icon: React.ReactNode;
      badgeVariant: "secondary" | "info" | "success";
      headerBorder: string;
      accentBg: string;
    }
  > = {
    TODO: {
      icon: <ListTodo className="h-4 w-4 text-slate-500" />,
      badgeVariant: "secondary",
      headerBorder: "border-slate-300 dark:border-slate-700",
      accentBg: "bg-slate-100/70 dark:bg-slate-800/40",
    },
    IN_PROGRESS: {
      icon: <Clock className="h-4 w-4 text-sky-500" />,
      badgeVariant: "info",
      headerBorder: "border-sky-300 dark:border-sky-700",
      accentBg: "bg-sky-50/50 dark:bg-sky-950/20",
    },
    DONE: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      badgeVariant: "success",
      headerBorder: "border-emerald-300 dark:border-emerald-700",
      accentBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    },
  };

  const config = columnConfigs[status];

  return (
    <div className="flex flex-col flex-1 min-w-[280px] sm:min-w-[320px] rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </h3>
          <Badge variant={config.badgeVariant} className="px-2 py-0 text-[11px]">
            {tasks.length}
          </Badge>
        </div>

        <Button
          size="xs"
          variant="ghost"
          onClick={() => onAddTask(status)}
          startIcon={<Plus className="h-3.5 w-3.5" />}
          className="text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 h-7"
        >
          Add
        </Button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 pt-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/40 dark:bg-slate-900/30">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No tasks in {title.toLowerCase()}
            </p>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onAddTask(status)}
              startIcon={<Plus className="h-3 w-3" />}
              className="mt-3 text-[11px] h-7"
            >
              Add Task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
