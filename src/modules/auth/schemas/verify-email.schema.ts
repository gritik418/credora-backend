import z from 'zod';

const VerifyEmailSchema = z.object({
  uid: z.string('Invalid user id.'),
  token: z.uuid('Invalid token.'),
});

export default VerifyEmailSchema;
