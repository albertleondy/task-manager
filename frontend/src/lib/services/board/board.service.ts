import axios from "..";
import type {
  Board,
  BoardsResponse,
  SingleBoardResponse,
  CreateBoardRequest,
} from ".";

export const getBoards = async (): Promise<BoardsResponse> => {
  try {
    const response = await axios({
      method: "get",
      url: "/boards",
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching boards:", error);
    return {
      data: [],
      error: "Failed to fetch boards",
    };
  }
};

export const getBoardById = async (id: number): Promise<SingleBoardResponse> => {
  try {
    const response = await axios({
      method: "get",
      url: `/boards/${id}`,
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching board by id:", error);
    return {
      data: null,
      error: "Failed to fetch board",
    };
  }
};

export const createBoard = async (
  payload: CreateBoardRequest
): Promise<SingleBoardResponse> => {
  try {
    const response = await axios({
      method: "post",
      url: "/boards",
      data: payload,
    });
    return {
      data: response.data.data,
      error: null,
    };
  } catch (error) {
    console.error("Error creating board:", error);
    return {
      data: null,
      error: "Failed to create board",
    };
  }
};

export const deleteBoard = async (id: number): Promise<void> => {
  try {
    await axios({
      method: "delete",
      url: `/boards/${id}`,
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};

export const boardService = {
  getAll: getBoards,
  getById: getBoardById,
  create: createBoard,
  delete: deleteBoard,
};

export default boardService;
