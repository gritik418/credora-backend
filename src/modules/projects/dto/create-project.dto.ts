import z from 'zod';
import CreateProjectSchema from '../schemas/create-project.schema';

type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export default CreateProjectDto;
