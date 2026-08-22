import z from 'zod';
import CreateWorkspaceSchema from '../schemas/create-workspace.schema';

type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;

export default CreateWorkspaceDto;
