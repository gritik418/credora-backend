import z from 'zod';
import AddAvailabilityInfoSchema from '../schemas/add-availability-info.schema';

type AddAvailabilityInfoDto = z.infer<typeof AddAvailabilityInfoSchema>;

export default AddAvailabilityInfoDto;
