import z from 'zod';

const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Workspace name is required.')
    .max(50, 'Workspace name can be at most 50 characters long.'),

  description: z
    .string()
    .trim()
    .max(255, 'Description can be at most 255 characters long.')
    .optional(),

  slug: z
    .string()
    .trim()
    .min(1, 'Workspace slug is required.')
    .max(50, 'Workspace slug can be at most 50 characters long.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Invalid slug format. Use only lowercase letters, numbers, and single hyphens.',
    ),

  logo: z.url('Logo must be a valid URL.').optional(),
});

export default CreateWorkspaceSchema;
