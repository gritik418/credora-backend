import z from 'zod';

const SaveSkillsSchema = z.object({
  skills: z
    .array(z.string().trim().min(1, 'Skill cannot be empty'))
    .nonempty('Skills are required.'),
});

export default SaveSkillsSchema;
