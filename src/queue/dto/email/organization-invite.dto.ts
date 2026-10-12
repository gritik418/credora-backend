import { OrganizationMemberRole } from 'generated/prisma/enums';

type OrganizationInviteDto = {
  organization: {
    name: string;
    logo: string;
    website: string;
    initial: string;
  };

  role: OrganizationMemberRole;

  invitedBy: {
    name: string;
    email: string;
    avatar: string;
    initial: string;
  };

  invitationLink: string;
  recipientEmail: string;

  department: string;
  designation: string;
};

export default OrganizationInviteDto;
