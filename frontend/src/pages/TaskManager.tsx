import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Calendar,
  Clock,
  FolderKanban,
  KanbanSquare,
  ChevronDown,
} from "lucide-react";
import type { Board } from "@/lib/services/board";
import type { Task, TaskStatus } from "@/lib/services/task";

import {
  useGetBoards,
  useGetTasks,
  useDeleteBoard,
  useUpdateTask,
  useDeleteTask,
} from "@/lib/hooks";
import { extractErrorMessage, formatDate } from "@/lib/utils";
import TaskColumn from "@/components/Task/TaskColumn";
import CreateBoardModal from "@/components/Board/CreateBoardModal";
import CreateTaskModal from "@/components/Task/CreateTaskModal";
import EditTaskModal from "@/components/Task/EditTaskModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import PageMeta from "@/components/common/PageMeta";
import EmptyState from "@/components/common/EmptyState";
import ErrorBanner from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import ButtonIcon from "@/components/ui/button/ButtonIcon";
import Badge from "@/components/ui/badge/Badge";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";
import { showToast } from "@/components/ui/toast/showToast";

export const TaskManager: React.FC = () => {
  // 1. Fetch all boards with React Query useQuery
  const {
    data: boards = [],
    isLoading: boardsLoading,
    error: boardsQueryError,
    refetch: refetchBoards,
  } = useGetBoards();

  const boardsError = boardsQueryError ? extractErrorMessage(boardsQueryError) : null;

  // Selected Board state
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

  // Automatically select the first board when boards load or change
  useEffect(() => {
    if (boards.length > 0) {
      if (!selectedBoardId || !boards.some((b) => b.id === selectedBoardId)) {
        setSelectedBoardId(boards[0].id);
      }
    } else {
      setSelectedBoardId(null);
    }
  }, [boards, selectedBoardId]);

  // 2. Fetch tasks for selected board with React Query useQuery
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksQueryError,
    refetch: refetchTasks,
  } = useGetTasks(selectedBoardId);

  const tasksError = tasksQueryError ? extractErrorMessage(tasksQueryError) : null;

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState<TaskStatus>("TODO");
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // 3. Mutations with React Query useMutation
  const deleteBoardMutation = useDeleteBoard();
  const isDeletingBoard = deleteBoardMutation.isPending;

  const updateTaskMutation = useUpdateTask(selectedBoardId ?? undefined);

  const deleteTaskMutation = useDeleteTask(selectedBoardId ?? undefined);
  const isDeletingTask = deleteTaskMutation.isPending;

  // Current active board
  const activeBoard = useMemo(() => {
    return boards.find((b) => b.id === selectedBoardId) || null;
  }, [boards, selectedBoardId]);

  // Board Handlers
  const handleBoardCreated = (newBoard: Board) => {
    setSelectedBoardId(newBoard.id);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      await deleteBoardMutation.mutateAsync(boardToDelete.id);
      showToast("success", `Board "${boardToDelete.name}" deleted`);

      const remainingBoards = boards.filter((b) => b.id !== boardToDelete.id);
      setSelectedBoardId(remainingBoards.length > 0 ? remainingBoards[0].id : null);
      setBoardToDelete(null);
    } catch (err) {
      const msg = extractErrorMessage(err);
      showToast("error", msg);
    }
  };

  // Task Handlers
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: { status: newStatus },
      });
      showToast("info", `Moved task to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      const msg = extractErrorMessage(err);
      showToast("error", msg);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      showToast("success", "Task deleted");
      setTaskToDelete(null);
    } catch (err) {
      const msg = extractErrorMessage(err);
      showToast("error", msg);
    }
  };

  const openAddTask = (status: TaskStatus = "TODO") => {
    setInitialTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  const todoTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "TODO"),
    [filteredTasks]
  );
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "IN_PROGRESS"),
    [filteredTasks]
  );
  const doneTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "DONE"),
    [filteredTasks]
  );

  return (
    <div className="space-y-6">
      <PageMeta
        title={activeBoard ? activeBoard.name : "Task Management"}
        description="Mini Task Management Application"
      />

      {/* Global Connection Error Banner */}
      {boardsError && (
        <ErrorBanner
          title="Backend Connection Failed"
          message={boardsError}
          onRetry={() => refetchBoards()}
          retrying={boardsLoading}
        />
      )}


      {/* Loading state for boards */}
      {boardsLoading && !boardsError && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" label="Loading application..." />
        </div>
      )}

      {/* When no boards exist at all */}
      {!boardsLoading && !boardsError && boards.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No boards created yet"
          description="Create your first board container to organize tasks into To Do, In Progress, and Done."
          actionText="Create Board"
          actionIcon={<Plus className="h-4 w-4" />}
          onAction={() => setIsCreateBoardOpen(true)}
        />
      )}

      {/* Main Single-Page Workspace */}
      {!boardsLoading && !boardsError && boards.length > 0 && activeBoard && (
        <>
          {/* Top Board Bar: Board Selector & Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Board Selector Tabs / Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                  Boards:
                </span>
                {boards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBoardId(b.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      selectedBoardId === b.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{b.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                        selectedBoardId === b.id
                          ? "bg-indigo-700/80 text-white"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {b.task_count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Board Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateBoardOpen(true)}
                  startIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  New Board
                </Button>
                <ButtonIcon
                  icon={<Trash2 className="h-4 w-4" />}
                  size="sm"
                  variant="ghost"
                  tooltipText={`Delete board "${activeBoard.name}"`}
                  onClick={() => setBoardToDelete(activeBoard)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  aria-label="Delete active board"
                />
              </div>
            </div>

            {/* Selected Board Header & Task Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {activeBoard.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(activeBoard.created_at)}</span>
                  </span>
                  {activeBoard.updated_at && activeBoard.updated_at !== activeBoard.created_at && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {formatDate(activeBoard.updated_at)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => openAddTask("TODO")}
                  startIcon={<Plus className="h-4 w-4" />}
                >
                  Add Task
                </Button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {s === "ALL"
                      ? "All"
                      : s === "TODO"
                      ? "To Do"
                      : s === "IN_PROGRESS"
                      ? "In Progress"
                      : "Done"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Task Error Banner if task loading fails */}
          {tasksError && (
            <ErrorBanner
              title="Failed to Load Tasks"
              message={tasksError}
              onRetry={() => refetchTasks()}
              retrying={tasksLoading}
            />
          )}


          {/* Task Loading Spinner */}
          {tasksLoading && !tasksError && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" label="Loading tasks..." />
            </div>
          )}

          {/* Kanban Columns */}
          {!tasksLoading && !tasksError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              <TaskColumn
                status="TODO"
                title="To Do"
                tasks={todoTasks}
                onAddTask={openAddTask}
                onEditTask={(t) => setTaskToEdit(t)}
                onDeleteTask={(t) => setTaskToDelete(t)}
                onStatusChange={handleStatusChange}
              />

              <TaskColumn
                status="IN_PROGRESS"
                title="In Progress"
                tasks={inProgressTasks}
                onAddTask={openAddTask}
                onEditTask={(t) => setTaskToEdit(t)}
                onDeleteTask={(t) => setTaskToDelete(t)}
                onStatusChange={handleStatusChange}
              />

              <TaskColumn
                status="DONE"
                title="Done"
                tasks={doneTasks}
                onAddTask={openAddTask}
                onEditTask={(t) => setTaskToEdit(t)}
                onDeleteTask={(t) => setTaskToDelete(t)}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </>
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onBoardCreated={handleBoardCreated}
      />

      {/* Delete Board Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(boardToDelete)}
        title="Delete Board"
        message={
          <>
            Are you sure you want to delete board{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              &ldquo;{boardToDelete?.name}&rdquo;
            </span>
            ? All tasks in this board will also be permanently deleted.
          </>
        }
        confirmText="Delete Board"
        isLoading={isDeletingBoard}
        onConfirm={confirmDeleteBoard}
        onCancel={() => setBoardToDelete(null)}
      />

      {/* Create Task Modal */}
      {activeBoard && (
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          boardId={activeBoard.id}
          initialStatus={initialTaskStatus}
          onClose={() => setIsCreateTaskOpen(false)}
        />
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        task={taskToEdit}
        isOpen={Boolean(taskToEdit)}
        onClose={() => setTaskToEdit(null)}
      />

      {/* Delete Task Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={
          <>
            Are you sure you want to delete task{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              &ldquo;{taskToDelete?.title}&rdquo;
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmText="Delete Task"
        isLoading={isDeletingTask}
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};

export default TaskManager;
