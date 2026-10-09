import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Board name must not be empty or whitespace only")
    .max(100, "Board name must not exceed 100 characters"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
