import z from 'zod';
import ResendVerificationEmailSchema from '../schemas/resend-verification-email.schema';

type ResendVerificationEmailDto = z.infer<typeof ResendVerificationEmailSchema>;

export default ResendVerificationEmailDto;
