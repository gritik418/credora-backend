import z from 'zod';

const LoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Identifier is required.')
    .max(100, "Identifier can't exceed 100 characters."),
  password: z
    .string()
    .min(1, 'Password is required')
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

export default LoginSchema;
