import { TaskPriority, TaskStatus } from 'generated/prisma/enums';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required.')
    .max(200, 'Task title is too long.'),

  description: z.string().optional(),

  status: z.enum(TaskStatus).default(TaskStatus.TODO),

  priority: z.enum(TaskPriority).default(TaskPriority.MEDIUM),

  startDate: z.coerce.date().optional().default(new Date()),

  dueDate: z.coerce.date().optional(),

  assignees: z
    .array(z.string().min(1, 'Assignee ID is required'))
    .min(1, 'At least one assignee is required.'),

  reviewers: z.array(z.string().min(1, 'Reviewer ID is required')).optional(),

  labels: z.array(z.string()).optional(),
});

export default CreateTaskSchema;
