import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import AddProfessionalInfoDto from './dto/add-professional-info.dto';
import { OnboardingStep } from 'generated/prisma/enums';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        role: true,
        profile: {
          select: {
            id: true,
            headline: true,
            profession: true,
            industry: true,
            bio: true,
            city: true,
            state: true,
            country: true,
            website: true,
            linkedinUrl: true,
            githubUrl: true,
            skills: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            isOpenToWork: true,
            isOpenToCollaborate: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    return {
      success: true,
      message: 'User fetched successfully',
      user,
    };
  }

  async addProfessionalInfo(data: AddProfessionalInfoDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const onboarding = await this.prismaService.userOnboarding.findUnique({
      where: {
        userId,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found.');

    if (onboarding.currentStep !== OnboardingStep.PROFESSIONAL)
      throw new BadRequestException(
        'Please complete the previous step before proceeding.',
      );

    await this.prismaService.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: {
          userId,
        },
        update: {
          headline: data.headline,
          profession: data.profession,
          industry: data.industry,
          updatedAt: new Date(),
        },
        create: {
          userId,
          headline: data.headline,
          profession: data.profession,
          industry: data.industry,
        },
      });

      await tx.userOnboarding.update({
        where: {
          userId,
        },
        data: {
          professionalInfoCompleted: true,
          currentStep: OnboardingStep.SUMMARY,
        },
      });
    });

    return {
      success: true,
      message: 'Professional information added successfully.',
    };
  }
}
