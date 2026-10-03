import z from 'zod';

const ResendVerificationEmailSchema = z.object({
  email: z.email('Invalid email address.'),
});

export default ResendVerificationEmailSchema;
