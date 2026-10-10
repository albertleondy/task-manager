import React from "react";
import { Edit3, Trash2, Clock, Calendar, CheckCircle2, PlayCircle, RotateCcw } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/services/task";

import { Card, CardContent } from "@/components/ui/card/Card";
import Badge from "@/components/ui/badge/Badge";
import ButtonIcon from "@/components/ui/button/ButtonIcon";
import Button from "@/components/ui/button/Button";
import { formatDate } from "@/lib/utils";

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const statusBadges: Record<TaskStatus, { variant: "secondary" | "info" | "success"; label: string }> = {
    TODO: { variant: "secondary", label: "To Do" },
    IN_PROGRESS: { variant: "info", label: "In Progress" },
    DONE: { variant: "success", label: "Done" },
  };

  return (
    <Card className="group relative bg-white hover:border-slate-300 dark:bg-slate-900 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        {/* Header: Title and Actions */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words flex-1">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
            <ButtonIcon
              icon={<Edit3 className="h-3.5 w-3.5" />}
              size="xs"
              tooltipText="Edit task"
              onClick={() => onEdit(task)}
              className="text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Edit task"
            />
            <ButtonIcon
              icon={<Trash2 className="h-3.5 w-3.5" />}
              size="xs"
              tooltipText="Delete task"
              onClick={() => onDelete(task)}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              aria-label="Delete task"
            />
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Status Dropdown and Date Info */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor={`status-select-${task.id}`} className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Status:
              </label>
              <select
                id={`status-select-${task.id}`}
                value={task.status}
                onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                className="text-xs font-medium rounded-md border border-slate-200 bg-slate-50/80 py-1 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                aria-label="Change task status"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {task.status === "TODO" && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onStatusChange(task, "IN_PROGRESS")}
                  startIcon={<PlayCircle className="h-3 w-3 text-sky-500" />}
                  className="text-[11px] h-6 px-2"
                >
                  Start
                </Button>
              )}

              {task.status === "IN_PROGRESS" && (
                <div className="flex items-center gap-1">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => onStatusChange(task, "TODO")}
                    startIcon={<RotateCcw className="h-3 w-3 text-slate-400" />}
                    className="text-[11px] h-6 px-1.5"
                    title="Move back to To Do"
                  >
                    Back
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => onStatusChange(task, "DONE")}
                    startIcon={<CheckCircle2 className="h-3 w-3" />}
                    className="text-[11px] h-6 px-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Done
                  </Button>
                </div>
              )}

              {task.status === "DONE" && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onStatusChange(task, "IN_PROGRESS")}
                  startIcon={<RotateCcw className="h-3 w-3 text-amber-500" />}
                  className="text-[11px] h-6 px-2"
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
            {task.updated_at && task.updated_at !== task.created_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Updated: {formatDate(task.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
