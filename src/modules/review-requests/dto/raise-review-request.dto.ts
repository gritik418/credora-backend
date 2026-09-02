import z from 'zod';
import RaiseReviewRequestSchema from '../schemas/raise-review-request.schema';

type RaiseReviewRequestDto = z.infer<typeof RaiseReviewRequestSchema>;

export default RaiseReviewRequestDto;
