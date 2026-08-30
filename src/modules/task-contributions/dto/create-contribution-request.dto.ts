import z from 'zod';
import CreateContributionRequestSchema from '../schemas/create-contribution-request.schema';

type CreateContributionRequestDto = z.infer<
  typeof CreateContributionRequestSchema
>;

export default CreateContributionRequestDto;
