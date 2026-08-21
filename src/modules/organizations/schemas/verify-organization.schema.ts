import { z } from 'zod';

const VerifyOrganizationSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  oid: z.string().min(1, 'Organization ID is required.'),
});

export default VerifyOrganizationSchema;
