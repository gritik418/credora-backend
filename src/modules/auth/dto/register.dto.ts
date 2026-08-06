import z from 'zod';
import RegisterSchema from '../schemas/register.schema';

type RegisterDto = z.infer<typeof RegisterSchema>;

export default RegisterDto;
