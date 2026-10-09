import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title must not be empty or whitespace only")
    .max(200, "Task title must not exceed 200 characters"),
  description: z.string().trim().max(1000, "Description must not exceed 1000 characters").optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    errorMap: () => ({ message: "Status must be 'TODO', 'IN_PROGRESS', or 'DONE'" }),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title must not be empty or whitespace only")
    .max(200, "Task title must not exceed 200 characters"),
  description: z.string().trim().max(1000, "Description must not exceed 1000 characters").optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    errorMap: () => ({ message: "Status must be 'TODO', 'IN_PROGRESS', or 'DONE'" }),
  }),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
