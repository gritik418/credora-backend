import z from 'zod';
import OrganizationLoginSchema from '../schemas/organization-login.schema';

type OrganizationLoginDto = z.infer<typeof OrganizationLoginSchema>;

export default OrganizationLoginDto;
