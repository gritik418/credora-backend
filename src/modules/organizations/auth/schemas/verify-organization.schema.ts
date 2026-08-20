import z from 'zod';

const VerifyOrganizationSchema = z.object({
  oid: z.string('Invalid organization ID.'),
  token: z.uuid('Invalid verification token.'),
});

export default VerifyOrganizationSchema;
