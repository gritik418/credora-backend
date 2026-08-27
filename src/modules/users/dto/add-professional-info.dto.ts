import z from 'zod';
import AddProfessionalInfoSchema from '../schemas/add-professional-info.schema';

type AddProfessionalInfoDto = z.infer<typeof AddProfessionalInfoSchema>;

export default AddProfessionalInfoDto;
