import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/textarea/Textarea";
import Select from "@/components/ui/select/Select";
import Button from "@/components/ui/button/Button";
import { Calendar, Clock } from "lucide-react";
import { useUpdateTask } from "@/lib/hooks";
import { showToast } from "@/components/ui/toast/showToast";
import { extractErrorMessage, formatDate } from "@/lib/utils";
import { updateTaskSchema } from "@/lib/validations";
import type { Task, TaskStatus } from "@/lib/services/task";


export interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [error, setError] = useState<string | null>(null);

  const updateTaskMutation = useUpdateTask(task?.board_id);
  const loading = updateTaskMutation.isPending;

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setError(null);
    }
  }, [task, isOpen]);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using Zod schema
    const validationResult = updateTaskSchema.safeParse({
      title,
      description: description.trim() || undefined,
      status,
    });

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      setError(issue?.message || "Invalid task input");
      return;
    }

    try {
      setError(null);
      const updatedTask = await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: {
          title: validationResult.data.title,
          description: validationResult.data.description || null,
          status: validationResult.data.status,
        },
      });
      showToast("success", `Task updated successfully`);
      onTaskUpdated?.(updatedTask);
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showToast("error", msg);
    }
  };


  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Task"
      description="Update task details or change status."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Created: {formatDate(task.created_at)}</span>
          </span>
          {task.updated_at && task.updated_at !== task.created_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Updated: {formatDate(task.updated_at)}</span>
            </span>
          )}
        </div>

        <Input
          label="Title"
          placeholder="Task title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          error={error || undefined}
          autoFocus
          disabled={loading}
          maxLength={200}
        />

        <Textarea
          label="Description"
          placeholder="Task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={3}
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          disabled={loading}
          options={[
            { value: "TODO", label: "To Do" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "DONE", label: "Done" },
          ]}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!title.trim()}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;
