import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBoards,
  getBoardById,
  createBoard,
  deleteBoard,
  type Board,
  type CreateBoardRequest,
} from "@/lib/services/board";

export const BOARD_QUERY_KEYS = {
  all: ["boards"] as const,
  detail: (id: number) => ["boards", id] as const,
};

/**
 * useQuery for fetching all boards
 */
export function useGetBoards() {
  return useQuery<Board[]>({
    queryKey: BOARD_QUERY_KEYS.all,
    queryFn: async () => {
      const res = await getBoards();
      if (res.error) {
        throw new Error(res.error);
      }
      return res.data;
    },
  });
}

/**
 * useQuery for fetching a single board by ID
 */
export function useGetBoardById(boardId: number | null) {
  return useQuery<Board | null>({
    queryKey: BOARD_QUERY_KEYS.detail(boardId!),
    queryFn: async () => {
      const res = await getBoardById(boardId!);
      if (res.error || !res.data) {
        throw new Error(res.error || "Failed to fetch board");
      }
      return res.data;
    },
    enabled: !!boardId,
  });
}

/**
 * Backwards compatibility aliases
 */
export const useBoards = useGetBoards;
export const useBoard = useGetBoardById;

/**
 * useMutation for creating a new board
 */
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation<Board, Error, CreateBoardRequest>({
    mutationFn: async (data: CreateBoardRequest) => {
      const res = await createBoard(data);
      if (res.error || !res.data) {
        throw new Error(res.error || "Failed to create board");
      }
      return res.data;
    },
    onSuccess: () => {
      // Invalidate boards list to refresh data
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

/**
 * useMutation for deleting a board
 */
export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (boardId: number) => deleteBoard(boardId),
    onSuccess: () => {
      // Invalidate boards query
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}
