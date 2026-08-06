import { UserRole } from 'generated/prisma/enums';

export type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
};
