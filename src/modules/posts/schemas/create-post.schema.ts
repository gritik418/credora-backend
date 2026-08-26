import { PostCommentPermission, PostVisibility } from 'generated/prisma/enums';
import { z } from 'zod';

const CreatePostSchema = z.object({
  content: z
    .string()
    .trim()
    .max(5000, 'Post content cannot exceed 5000 characters.')
    .optional(),

  visibility: z.enum(PostVisibility).default(PostVisibility.PUBLIC),

  commentPermission: z
    .enum(PostCommentPermission)
    .default(PostCommentPermission.EVERYONE),

  hashtags: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Hashtag cannot be empty.')
        .max(50, 'Hashtag cannot exceed 50 characters.'),
    )
    .max(5, 'Maximum 5 hashtags allowed.')
    .default([]),
});

export default CreatePostSchema;
