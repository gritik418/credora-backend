import z from 'zod';

const RegisterOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Organization name is required.')
      .max(100, 'Organization name cannot exceed 100 characters.'),

    email: z
      .email('Please provide a valid organization email.')
      .trim()
      .toLowerCase(),

    slug: z
      .string()
      .trim()
      .min(1, 'Organization slug is required.')
      .max(50, 'Organization slug cannot exceed 50 characters.')
      .regex(
        /^[a-z0-9-]+$/,
        'Organization slug must contain only lowercase letters, numbers, and hyphens.',
      ),

    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters.')
      .optional(),

    logo: z.url('Logo must be a valid URL.').optional(),

    website: z.url('Website must be a valid URL.').optional(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(20, "Password can't exceed 20 characters.")
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(
        /[\W_]/,
        'Password must contain at least one special character (e.g., @, #, $, etc.).',
      ),

    passwordConfirmation: z
      .string()
      .min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password.',
    path: ['passwordConfirmation'],
  });

export default RegisterOrganizationSchema;
