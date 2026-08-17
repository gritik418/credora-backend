import z from 'zod';

const OrganizationLoginSchema = z.object({
  email: z.email('Please provide a valid email address.'),
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
});

export default OrganizationLoginSchema;
