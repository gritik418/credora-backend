import z from 'zod';
import AddWorkspaceMembersSchema from '../schemas/add-workspace-members.schema';

type AddWorkspaceMembersDto = z.infer<typeof AddWorkspaceMembersSchema>;

export default AddWorkspaceMembersDto;
