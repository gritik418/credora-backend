import { EmploymentType } from 'generated/prisma/enums';
import { z } from 'zod';

const ExperienceSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(2, 'Company name must be at least 2 characters.')
      .max(200),

    position: z
      .string()
      .trim()
      .min(2, 'Position must be at least 2 characters.')
      .max(150),

    employmentType: z.enum(EmploymentType).optional(),

    startDate: z.coerce.date({
      message: 'Invalid start date.',
    }),

    endDate: z.coerce.date().optional(),

    isCurrentlyWorking: z.boolean().default(false),

    location: z.string().trim().max(200).optional(),

    description: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrentlyWorking && !data.endDate) {
        return false;
      }

      return true;
    },
    {
      message: 'End date is required when you are not currently working.',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.endDate) return true;

      return data.endDate >= data.startDate;
    },
    {
      message: 'End date must be after the start date.',
      path: ['endDate'],
    },
  );

const AddExperienceInfoSchema = z.object({
  experiences: z
    .array(ExperienceSchema)
    .min(1, 'Please add at least one experience record.')
    .max(20, 'Maximum 20 experience records allowed.'),
});

export default AddExperienceInfoSchema;
