import z from 'zod';

const SendConnectionRequestSchema = z.object({
  receiverId: z.string().trim().min(1, 'Receiver ID is required'),

  message: z
    .string()
    .trim()
    .max(500, 'Connection note cannot exceed 500 characters')
    .optional(),
});

export default SendConnectionRequestSchema;
