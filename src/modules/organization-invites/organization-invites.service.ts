import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import SendInviteDto from './dto/send-invite.dto';
import { Request } from 'express';
import {
  OrganizationInviteStatus,
  OrganizationMemberRole,
} from 'generated/prisma/enums';
import { randomBytes } from 'crypto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { ConfigService } from '@nestjs/config';
import { EmailProducer } from 'src/queue/producers/email.producer';

@Injectable()
export class OrganizationInvitesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly emailProducer: EmailProducer,
  ) {}

  async sendInvite(data: SendInviteDto, req: Request) {
    const userId = req.user.id;
    const organizationId = req.params.organizationId as string;

    if (!userId) throw new UnauthorizedException('Unauthorized.');
    if (!organizationId)
      throw new BadRequestException('Organization id is required.');

    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        logo: true,
        website: true,
      },
    });

    if (!organization) throw new BadRequestException('Organization not found.');

    const invitedBy = await this.prismaService.user.findUnique({
      where: { id: userId, isEmailVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        organizationMembers: {
          where: {
            organizationId: organizationId,
          },
          select: {
            isActive: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invitedBy) throw new UnauthorizedException('Unauthorized.');

    if (!invitedBy.isActive)
      throw new ForbiddenException('Your account is not active.');

    const member = invitedBy.organizationMembers.find(
      (member) => member.organization.id === organizationId,
    );

    if (!member)
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );

    if (!member.isActive)
      throw new ForbiddenException(
        'Your membership is not active. Please contact your organization administrator.',
      );

    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN &&
      member.role !== OrganizationMemberRole.RECRUITER &&
      member.role !== OrganizationMemberRole.MANAGER
    )
      throw new ForbiddenException('You are not authorized to send invites.');

    if (data.role === OrganizationMemberRole.OWNER)
      throw new ForbiddenException('You cannot invite an owner.');

    if (
      data.role !== OrganizationMemberRole.MEMBER &&
      member.role !== OrganizationMemberRole.ADMIN &&
      member.role !== OrganizationMemberRole.OWNER
    )
      throw new ForbiddenException(
        'You can only invite members with the role of MEMBER. Please contact your organization administrator for other roles.',
      );

    const recipient = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (!recipient)
      throw new BadRequestException('Cannot invite an unregistered user.');

    if (!recipient.isEmailVerified || !recipient.isActive)
      throw new BadRequestException(
        'Cannot invite unverified or inactive user.',
      );

    const existingMember =
      await this.prismaService.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            organizationId: organizationId,
            userId: recipient.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingMember)
      throw new BadRequestException(
        'User is already a member of this organization.',
      );

    const existingInvite =
      await this.prismaService.organizationInvite.findFirst({
        where: {
          email: data.email,
          organizationId: organizationId,
          status: OrganizationInviteStatus.PENDING,
        },
        select: {
          id: true,
          status: true,
          expiresAt: true,
        },
      });

    if (existingInvite) {
      const isExpired = existingInvite?.expiresAt < new Date();

      if (!isExpired)
        throw new ConflictException(
          'An invitation has already been sent to this email address.',
        );
    }

    await this.prismaService.organizationInvite.updateMany({
      where: {
        email: data.email,
        organizationId: organizationId,
        status: OrganizationInviteStatus.PENDING,
      },
      data: {
        status: OrganizationInviteStatus.EXPIRED,
      },
    });

    const token: string = randomBytes(32).toString('hex');
    const hashedToken: string = await this.hashingService.hashValue(token, 8);

    const invite = await this.prismaService.organizationInvite.create({
      data: {
        email: data.email,
        organizationId: organizationId,
        invitedById: userId,
        role: data.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: OrganizationInviteStatus.PENDING,
        token: hashedToken,
      },
    });

    const invitationLink: string = `${this.configService.get<string>('CLIENT_URL')}/organization/${organizationId}/invites?token=${token}`;

    await this.emailProducer.sendOrganizationInviteEmail({
      invitationLink,
      invitedBy: {
        name: invitedBy.name,
        email: invitedBy.email,
        avatar: invitedBy.avatar || '',
        initial: invitedBy.name.charAt(0).toUpperCase(),
      },
      recipientEmail: data.email,
      organization: {
        name: organization.name,
        logo: organization.logo || '',
        website: organization.website || '',
        initial: organization.name.charAt(0).toUpperCase(),
      },
      role: data.role,
    });

    return {
      success: true,
      message: 'Invite sent successfully.',
      inviteId: invite.id,
    };
  }

  async revokeInvite(inviteId: string, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    if (!inviteId) throw new BadRequestException('Invite id is required.');

    const invite = await this.prismaService.organizationInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException('Invite not found.');

    if (invite.status !== OrganizationInviteStatus.PENDING)
      throw new BadRequestException('Invite is not active. Cannot revoke it.');

    const member = await this.prismaService.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: invite.organizationId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!member)
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );

    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN &&
      member.role !== OrganizationMemberRole.RECRUITER &&
      member.role !== OrganizationMemberRole.MANAGER
    )
      throw new ForbiddenException('You are not authorized to revoke invites.');

    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN &&
      invite.role !== OrganizationMemberRole.MEMBER
    )
      throw new ForbiddenException(
        'You are not authorized to revoke this invite.',
      );

    await this.prismaService.organizationInvite.update({
      where: { id: inviteId },
      data: {
        status: OrganizationInviteStatus.REVOKED,
        revokedAt: new Date(),
        revokedById: userId,
      },
    });

    return {
      success: true,
      message: 'Invite revoked successfully.',
    };
  }

  async resendInvite(inviteId: string, req: Request) {
    const userId: string = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    if (!inviteId) throw new BadRequestException('Invite id is required.');

    const invite = await this.prismaService.organizationInvite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        email: true,
        organizationId: true,
        role: true,
        invitedById: true,
        organization: {
          select: {
            name: true,
            logo: true,
            website: true,
          },
        },
      },
    });

    if (!invite) throw new NotFoundException('Invite not found.');

    const member = await this.prismaService.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: invite.organizationId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!member)
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );

    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN &&
      member.role !== OrganizationMemberRole.RECRUITER &&
      member.role !== OrganizationMemberRole.MANAGER
    )
      throw new ForbiddenException('You are not authorized to resend invites.');

    if (invite.status === OrganizationInviteStatus.ACCEPTED)
      throw new BadRequestException('Invite has already been accepted.');

    if (invite.status === OrganizationInviteStatus.REVOKED)
      throw new BadRequestException(
        'Invite has been revoked. Create a new invite to invite the user.',
      );

    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN &&
      invite.role !== OrganizationMemberRole.MEMBER
    )
      throw new ForbiddenException('You cannot resend this invite.');

    await this.prismaService.organizationInvite.updateMany({
      where: {
        email: invite.email,
        organizationId: invite.organizationId,
        status: OrganizationInviteStatus.PENDING,
      },
      data: {
        status: OrganizationInviteStatus.EXPIRED,
      },
    });

    const token: string = randomBytes(32).toString('hex');
    const hashedToken: string = await this.hashingService.hashValue(token, 8);

    const updatedInvite = await this.prismaService.organizationInvite.create({
      data: {
        email: invite.email,
        organizationId: invite.organizationId,
        invitedById: userId,
        role: invite.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: OrganizationInviteStatus.PENDING,
        token: hashedToken,
      },
    });

    const invitationLink: string = `${this.configService.get<string>('CLIENT_URL')}/organization/${invite.organizationId}/invites?token=${token}`;

    await this.emailProducer.sendOrganizationInviteEmail({
      invitationLink,
      invitedBy: {
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar || '',
        initial: member.user.name.charAt(0).toUpperCase(),
      },
      recipientEmail: invite.email,
      organization: {
        name: invite.organization.name,
        logo: invite.organization.logo || '',
        website: invite.organization.website || '',
        initial: invite.organization.name.charAt(0).toUpperCase(),
      },
      role: invite.role,
    });

    return {
      success: true,
      message: 'Invite resent successfully.',
      inviteId: updatedInvite.id,
    };
  }
}
