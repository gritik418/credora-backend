import { TaskPriority, TaskStatus } from 'generated/prisma/enums';
import z from 'zod';

const TaskQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(TaskPriority).optional(),
  sortBy: z
    .enum(['dueDate', 'startDate', 'createdAt', 'completedAt', 'updatedAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export default TaskQuerySchema;
