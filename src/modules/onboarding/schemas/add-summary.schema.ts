import { z } from 'zod';

const AddSummarySchema = z.object({
  summary: z.string().min(1).max(1000),
});

export default AddSummarySchema;
