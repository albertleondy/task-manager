export * from "./task.service";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  board_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TasksResponse {
  data: Task[];
  error: string | null;
}

export interface SingleTaskResponse {
  data: Task | null;
  error: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
}
