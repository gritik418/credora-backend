import z from 'zod';
import SendInviteSchema from '../schemas/send-invite.schema';

type SendInviteDto = z.infer<typeof SendInviteSchema>;

export default SendInviteDto;
