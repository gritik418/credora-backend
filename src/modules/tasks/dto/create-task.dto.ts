import z from 'zod';
import CreateTaskSchema from '../schemas/create-task.schema';

type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export default CreateTaskDto;
