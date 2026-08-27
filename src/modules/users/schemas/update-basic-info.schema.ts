import { z } from 'zod';

const UpdateBasicInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long.')
    .max(100, 'Name must be at most 100 characters long.'),
});

export default UpdateBasicInfoSchema;
