import z from 'zod';

const AddWorkspaceMembersSchema = z.object({
  members: z.array(z.cuid2()),
});

export default AddWorkspaceMembersSchema;
