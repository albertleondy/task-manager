export * from "./board.service";

export interface Board {
  id: number;
  name: string;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
  task_count: number;
}

export interface BoardsResponse {
  data: Board[];
  error: string | null;
}

export interface SingleBoardResponse {
  data: Board | null;
  error: string | null;
}

export interface CreateBoardRequest {
  name: string;
}
