import { z } from 'zod';

const RaiseReviewRequestSchema = z.object({
    message: z.string().optional(),
});

export default RaiseReviewRequestSchema;