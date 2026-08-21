import z from 'zod';
import CreateOrganizationSchema from '../schemas/create-organization.schema';

type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;

export default CreateOrganizationDto;
