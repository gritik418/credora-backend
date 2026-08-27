import z from 'zod';
import UpdateBasicInfoSchema from '../schemas/update-basic-info.schema';

type UpdateBasicInfoDto = z.infer<typeof UpdateBasicInfoSchema>;

export default UpdateBasicInfoDto;
