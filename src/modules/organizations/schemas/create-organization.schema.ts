import z from 'zod';

const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Organization name is required.' })
    .max(50, { message: 'Organization name cannot exceed 50 characters.' }),
  supportEmail: z.email({ message: 'Invalid support email address.' }),

  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long.' })
    .max(63, { message: 'Slug cannot exceed 63 characters.' })
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
      'Slug can only contain lowercase letters, numbers, and hyphens.',
    ),
  description: z
    .string()
    .max(1000, { message: 'Description cannot exceed 1000 characters.' })
    .optional(),
  logo: z.url({ message: 'Logo must be a valid URL.' }).optional(),
  website: z.url({ message: 'Website URL must be a valid URL.' }).optional(),
});

export default CreateOrganizationSchema;
