import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/textarea/Textarea";
import Select from "@/components/ui/select/Select";
import Button from "@/components/ui/button/Button";
import { useCreateTask } from "@/lib/hooks";
import { showToast } from "@/components/ui/toast/showToast";
import { extractErrorMessage } from "@/lib/utils";
import { createTaskSchema } from "@/lib/validations";
import type { Task, TaskStatus } from "@/lib/services/task";


export interface CreateTaskModalProps {
  isOpen: boolean;
  boardId: number;
  initialStatus?: TaskStatus;
  onClose: () => void;
  onTaskCreated?: (newTask: Task) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  boardId,
  initialStatus = "TODO",
  onClose,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  const createTaskMutation = useCreateTask(boardId);
  const loading = createTaskMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus);
      setTitle("");
      setDescription("");
      setError(null);
    }
  }, [isOpen, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using Zod schema
    const validationResult = createTaskSchema.safeParse({
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
      const newTask = await createTaskMutation.mutateAsync({
        title: validationResult.data.title,
        description: validationResult.data.description,
        status: validationResult.data.status,
      });
      showToast("success", `Task "${newTask.title}" created successfully`);
      onTaskCreated?.(newTask);
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
      title="Create New Task"
      description="Add a new task item to this board."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Title"
          placeholder="e.g. Implement user authentication"
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
          label="Description (Optional)"
          placeholder="Add details, acceptance criteria, or notes..."
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
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
