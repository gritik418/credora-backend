import z from 'zod';
import VerifyEmailSchema from '../schemas/verify-email.schema';

type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;

export default VerifyEmailDto;
