import z from 'zod';
import AddProfessionalInfoSchema from '../../onboarding/schemas/add-professional-info.schema';

type AddProfessionalInfoDto = z.infer<typeof AddProfessionalInfoSchema>;

export default AddProfessionalInfoDto;
