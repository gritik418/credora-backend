import { Prisma } from 'generated/prisma/client';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: {
      include: {
        skills: true;
      };
    };
  };
}>;
