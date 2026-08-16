import z from 'zod';
import RegisterOrganizationSchema from '../schemas/register-organization.schema';

type RegisterOrganizationDto = z.infer<typeof RegisterOrganizationSchema>;

export default RegisterOrganizationDto;
