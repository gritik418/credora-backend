import z from 'zod';
import SaveSkillsSchema from '../schemas/save-skills.schema';

type SaveSkillsDto = z.infer<typeof SaveSkillsSchema>;

export default SaveSkillsDto;
