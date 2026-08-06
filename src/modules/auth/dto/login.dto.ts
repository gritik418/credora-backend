import z from 'zod';
import LoginSchema from '../schemas/login.schema';

type LoginDto = z.infer<typeof LoginSchema>;

export default LoginDto;
