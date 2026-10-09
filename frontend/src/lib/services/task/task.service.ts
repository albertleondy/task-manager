import axios from "..";
import type {
  Task,
  TasksResponse,
  SingleTaskResponse,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
} from ".";

export const getTasksByBoardId = async (
  boardId: number,
  status?: TaskStatus
): Promise<TasksResponse> => {
  try {
    const response = await axios({
      method: "get",
      url: `/boards/${boardId}/tasks`,
      params: status ? { status } : undefined,
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching tasks by board id:", error);
    return {
      data: [],
      error: "Failed to fetch tasks",
    };
  }
};

export const getTaskById = async (taskId: number): Promise<SingleTaskResponse> => {
  try {
    const response = await axios({
      method: "get",
      url: `/tasks/${taskId}`,
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching task by id:", error);
    return {
      data: null,
      error: "Failed to fetch task",
    };
  }
};

export const createTask = async (
  boardId: number,
  payload: CreateTaskRequest
): Promise<SingleTaskResponse> => {
  try {
    const response = await axios({
      method: "post",
      url: `/boards/${boardId}/tasks`,
      data: payload,
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      data: null,
      error: "Failed to create task",
    };
  }
};

export const updateTask = async (
  taskId: number,
  payload: UpdateTaskRequest
): Promise<SingleTaskResponse> => {
  try {
    const response = await axios({
      method: "patch",
      url: `/tasks/${taskId}`,
      data: payload,
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      data: null,
      error: "Failed to update task",
    };
  }
};

export const deleteTask = async (taskId: number): Promise<void> => {
  try {
    await axios({
      method: "delete",
      url: `/tasks/${taskId}`,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const taskService = {
  getByBoardId: getTasksByBoardId,
  getById: getTaskById,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
};

export default taskService;
