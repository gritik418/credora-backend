import z from 'zod';
import SendConnectionRequestSchema from '../schemas/send-connection-request.schema';

type SendConnectionRequestDto = z.infer<typeof SendConnectionRequestSchema>;

export default SendConnectionRequestDto;
