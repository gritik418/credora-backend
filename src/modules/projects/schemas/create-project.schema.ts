import z from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  slug: z
    .string()
    .min(1, 'Project slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid project slug'),
  description: z.string().optional(),
  logo: z.url().optional(),
  startDate: z.coerce.date().default(new Date()),
  dueDate: z.coerce.date(),
});

export default CreateProjectSchema;
