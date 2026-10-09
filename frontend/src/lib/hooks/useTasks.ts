import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasksByBoardId,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskStatus,
  type CreateTaskRequest,
  type UpdateTaskRequest,
} from "@/lib/services/task";
import { BOARD_QUERY_KEYS } from "./useBoards";

export const TASK_QUERY_KEYS = {
  byBoard: (boardId: number, status?: TaskStatus) =>
    ["tasks", boardId, ...(status ? [status] : [])] as const,
};

/**
 * useQuery for fetching tasks belonging to a board
 */
export function useGetTasks(boardId: number | null, status?: TaskStatus) {
  return useQuery<Task[]>({
    queryKey: TASK_QUERY_KEYS.byBoard(boardId!, status),
    queryFn: async () => {
      const res = await getTasksByBoardId(boardId!, status);
      if (res.error) {
        throw new Error(res.error);
      }
      return res.data;
    },
    enabled: !!boardId,
  });
}

/**
 * Backwards compatibility alias
 */
export const useTasks = useGetTasks;

/**
 * useMutation for creating a new task
 */
export function useCreateTask(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskRequest>({
    mutationFn: async (data: CreateTaskRequest) => {
      const res = await createTask(boardId, data);
      if (res.error || !res.data) {
        throw new Error(res.error || "Failed to create task");
      }
      return res.data;
    },
    onSuccess: () => {
      // Invalidate tasks query for this board and board list (for task_count)
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

/**
 * useMutation for updating task status or details (PATCH)
 */
export function useUpdateTask(boardId?: number) {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { taskId: number; data: UpdateTaskRequest }>({
    mutationFn: async ({ taskId, data }: { taskId: number; data: UpdateTaskRequest }) => {
      const res = await updateTask(taskId, data);
      if (res.error || !res.data) {
        throw new Error(res.error || "Failed to update task");
      }
      return res.data;
    },
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

/**
 * useMutation for deleting a task
 */
export function useDeleteTask(boardId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}
