import { z } from 'zod';
import AddExperienceInfoSchema from '../schemas/add-experience-info.schema';

type AddExperienceInfoDto = z.infer<typeof AddExperienceInfoSchema>;

export default AddExperienceInfoDto;
