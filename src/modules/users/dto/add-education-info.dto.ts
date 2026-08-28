import z from 'zod';
import AddEducationInfoSchema from '../schemas/add-education-info.schema';

type AddEducationInfoDto = z.infer<typeof AddEducationInfoSchema>;

export default AddEducationInfoDto;
