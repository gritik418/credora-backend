import { UserRole } from 'generated/prisma/enums';
import z, { RefinementCtx } from 'zod';

const RegisterSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters long.'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long.')
      .max(40, "Username can't exceed 40 characters.")
      .regex(
        /^[a-zA-Z0-9_]*$/,
        'Username can only contain letters, numbers and underscores.',
      ),
    email: z.email('Please enter a valid email address.').toLowerCase(),
    role: z.enum(UserRole).default(UserRole.EMPLOYEE),
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

    passwordConfirmation: z
      .string()
      .min(1, 'Password confirmation is required.'),
  })
  .superRefine(({ password, passwordConfirmation }, ctx: RefinementCtx) => {
    if (passwordConfirmation !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password confirmation must match the password.',
        path: ['passwordConfirmation'],
      });
    }
  });

export default RegisterSchema;
