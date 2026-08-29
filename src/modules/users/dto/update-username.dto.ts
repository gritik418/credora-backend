import z from 'zod';
import UpdateUsernameSchema from '../schemas/update-username.schema';

type UpdateUsernameDto = z.infer<typeof UpdateUsernameSchema>;

export default UpdateUsernameDto;
