import { z } from 'zod';

const AddProfessionalInfoSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(1, 'Headline is required.')
    .max(200, 'Headline must be at most 200 characters long.'),
  profession: z
    .string()
    .trim()
    .min(1, 'Profession is required.')
    .max(100, 'Profession must be at most 100 characters long.'),
  industry: z
    .string()
    .trim()
    .min(2)
    .max(100, 'Industry must be at most 100 characters long.')
    .optional(),
});

export default AddProfessionalInfoSchema;
