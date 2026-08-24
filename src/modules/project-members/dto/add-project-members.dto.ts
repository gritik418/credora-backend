import z from 'zod';
import AddProjectMembersSchema from '../schemas/add-project-members.schema';

type AddProjectMembersDto = z.infer<typeof AddProjectMembersSchema>;

export default AddProjectMembersDto;
