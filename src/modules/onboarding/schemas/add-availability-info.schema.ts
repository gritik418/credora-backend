import { z } from 'zod';

const AddAvailabilityInfoSchema = z.object({
  isOpenToWork: z.boolean().default(false),
  isOpenToCollaborate: z.boolean().default(false),
});

export default AddAvailabilityInfoSchema;
