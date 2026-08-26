import z from 'zod';
import CreatePostSchema from '../schemas/create-post.schema';

type CreatePostDto = z.infer<typeof CreatePostSchema>;

export default CreatePostDto;
