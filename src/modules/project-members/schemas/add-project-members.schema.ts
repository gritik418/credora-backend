import z from 'zod';

const AddProjectMembersSchema = z.object({
  members: z.array(z.cuid2()),
});

export default AddProjectMembersSchema;
