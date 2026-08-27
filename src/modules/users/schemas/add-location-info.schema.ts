import { z } from 'zod';

const AddLocationInfoSchema = z.object({
  city: z
    .string()
    .min(1, 'City name cannot be empty.')
    .max(100, 'City name cannot be longer than 100 characters.'),
  state: z
    .string()
    .min(1, 'State name cannot be empty.')
    .max(100, 'State name cannot be longer than 100 characters.'),
  country: z
    .string()
    .min(1, 'Country name cannot be empty.')
    .max(100, 'Country name cannot be longer than 100 characters.'),
});

export default AddLocationInfoSchema;
