import { UserRole } from 'generated/prisma/enums';

type UserVerificationEmailDto = {
  name: string;
  email: string;
  role: UserRole;
  verificationLink: string;
};

export default UserVerificationEmailDto;
