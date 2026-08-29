import { z } from 'zod';

const EducationSchema = z
  .object({
    institution: z
      .string()
      .trim()
      .min(2, 'Institution name must be at least 2 characters.')
      .max(200),

    degree: z.string().trim().max(150).optional(),

    fieldOfStudy: z.string().trim().max(150).optional(),

    startDate: z.coerce.date({
      message: 'Invalid start date.',
    }),

    endDate: z.coerce.date().optional(),

    grade: z.string().trim().max(50).optional(),

    description: z.string().trim().max(1000).optional(),

    isCurrentlyStudying: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.isCurrentlyStudying && !data.endDate) {
        return false;
      }

      return true;
    },
    {
      message: 'End date is required when you are not currently studying.',
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

const AddEducationInfoSchema = z.object({
  educations: z
    .array(EducationSchema)
    .min(1, 'Please add at least one education record.')
    .max(10, 'Maximum 10 education records allowed.'),
});

export default AddEducationInfoSchema;
