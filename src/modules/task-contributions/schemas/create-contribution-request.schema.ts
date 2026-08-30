import { z } from 'zod';

const CreateContributionRequestSchema = z.object({
  contribution: z
    .string()
    .min(1, 'Contribution is required.')
    .max(150, 'Contribution must be at most 150 characters.'),
  message: z
    .string()
    .max(500, 'Message must be at most 500 characters.')
    .optional(),
});

export default CreateContributionRequestSchema;
