import z from 'zod';
import AddLocationInfoSchema from '../schemas/add-location-info.schema';

type AddLocationInfoDto = z.infer<typeof AddLocationInfoSchema>;

export default AddLocationInfoDto;
