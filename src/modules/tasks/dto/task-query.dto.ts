import z from 'zod';
import TaskQuerySchema from '../schemas/task-query.schema';

type TaskQueryDto = z.infer<typeof TaskQuerySchema>;

export default TaskQueryDto;
