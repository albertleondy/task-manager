import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";
import { useCreateBoard } from "@/lib/hooks";
import { showToast } from "@/components/ui/toast/showToast";
import { extractErrorMessage } from "@/lib/utils";
import { createBoardSchema } from "@/lib/validations";
import type { Board } from "@/lib/services/board";


export interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (newBoard: Board) => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onBoardCreated,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createBoardMutation = useCreateBoard();
  const loading = createBoardMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using Zod schema
    const validationResult = createBoardSchema.safeParse({ name });
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      setError(issue?.message || "Invalid board input");
      return;
    }

    try {
      setError(null);
      const newBoard = await createBoardMutation.mutateAsync({ name: validationResult.data.name });
      showToast("success", `Board "${newBoard.name}" created successfully`);
      setName("");
      onBoardCreated(newBoard);
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      showToast("error", msg);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setError(null);
      onClose();
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Board"
      description="Organize your tasks and projects in a dedicated board."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Board Name"
          placeholder="e.g. Q4 Website Redesign"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          error={error || undefined}
          autoFocus
          disabled={loading}
          maxLength={100}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Create Board
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBoardModal;
