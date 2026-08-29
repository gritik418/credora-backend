import z from 'zod';
import AddSummarySchema from '../../onboarding/schemas/add-summary.schema';

type AddSummaryDto = z.infer<typeof AddSummarySchema>;

export default AddSummaryDto;
