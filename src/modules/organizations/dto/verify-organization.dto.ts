import { z } from 'zod';
import VerifyOrganizationSchema from '../schemas/verify-organization.schema';

type VerifyOrganizationDto = z.infer<typeof VerifyOrganizationSchema>;

export default VerifyOrganizationDto;
