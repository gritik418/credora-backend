import { z } from 'zod';

const UpdateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long.')
    .max(40, "Username can't exceed 40 characters.")
    .regex(
      /^[a-zA-Z0-9_]*$/,
      'Username can only contain letters, numbers and underscores.',
    ),
});

export default UpdateUsernameSchema;
