import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import { CustomUploadResult } from 'src/providers/cloudinary/cloudinary.interface';
import { UsersService } from '../users/users.service';
import UpdateBasicInfoDto from './dto/update-basic-info.dto';
import { OnboardingStep } from 'generated/prisma/enums';
import AddLocationInfoDto from './dto/add-location-info.dto';
import AddSummaryDto from './dto/add-summary.dto';
import AddProfessionalInfoDto from './dto/add-professional-info.dto';
import SaveSkillsDto from '../skills/dto/save-skills.dto';
import AddEducationInfoDto from './dto/add-education-info.dto';
import { Education } from 'generated/prisma/browser';
import { SkillsService } from '../skills/skills.service';
import AddAvailabilityInfoDto from './dto/add-availability-info.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
  ) {}

  async updateBasicInfo(
    data: UpdateBasicInfoDto,
    file: Express.Multer.File | null,
    req: Request,
  ) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        avatarPublicId: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    let uploadResult: CustomUploadResult | null = null;

    if (file) {
      uploadResult = await this.usersService.uploadAvatar(
        file,
        !!user.avatarPublicId,
        user.avatarPublicId ?? undefined,
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name: data.name,
          ...(uploadResult?.publicId && {
            avatarPublicId: uploadResult?.publicId,
            avatar: uploadResult?.url,
          }),
        },
      });

      await tx.userOnboarding.upsert({
        where: {
          userId,
        },
        update: {
          basicInfoCompleted: true,
          currentStep: OnboardingStep.PROFESSIONAL,
        },
        create: {
          userId,
          basicInfoCompleted: true,
          currentStep: OnboardingStep.PROFESSIONAL,
        },
      });
    });

    return {
      success: true,
      message: 'Basic info updated successfully.',
      nextStep: OnboardingStep.PROFESSIONAL,
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
      nextStep: OnboardingStep.SUMMARY,
    };
  }

  async addSummary(data: AddSummaryDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const onboarding = await this.prismaService.userOnboarding.findUnique({
      where: {
        userId,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found.');

    if (onboarding.currentStep !== OnboardingStep.SUMMARY)
      throw new BadRequestException(
        'Please complete the previous step before proceeding.',
      );

    await this.prismaService.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: {
          userId,
        },
        update: {
          bio: data.summary,
          updatedAt: new Date(),
        },
        create: {
          userId,
          bio: data.summary,
        },
      });

      await tx.userOnboarding.update({
        where: {
          userId,
        },
        data: {
          summaryCompleted: true,
          currentStep: OnboardingStep.LOCATION,
        },
      });
    });

    return {
      success: true,
      message: 'Summary added successfully.',
      nextStep: OnboardingStep.LOCATION,
    };
  }

  async addLocationInfo(data: AddLocationInfoDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const onboarding = await this.prismaService.userOnboarding.findUnique({
      where: {
        userId,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found.');

    if (onboarding.currentStep !== OnboardingStep.LOCATION)
      throw new BadRequestException(
        'Please complete the previous step before proceeding.',
      );

    await this.prismaService.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: {
          userId,
        },
        update: {
          city: data.city,
          state: data.state,
          country: data.country,
          updatedAt: new Date(),
        },
        create: {
          userId,
          city: data.city,
          state: data.state,
          country: data.country,
        },
      });

      await tx.userOnboarding.update({
        where: {
          userId,
        },
        data: {
          locationInfoCompleted: true,
          currentStep: OnboardingStep.SKILLS,
        },
      });
    });

    return {
      success: true,
      message: 'Location information added successfully.',
      nextStep: OnboardingStep.SKILLS,
    };
  }

  async addSkillsInfo(data: SaveSkillsDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const onboarding = await this.prismaService.userOnboarding.findUnique({
      where: {
        userId,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found.');

    if (onboarding.currentStep !== OnboardingStep.SKILLS)
      throw new BadRequestException(
        'Please complete the previous step before proceeding.',
      );

    const { skills } = await this.skillsService.saveSkills(data, req);

    if (!skills?.length) throw new BadRequestException('No skills found.');

    await this.prismaService.$transaction(async (tx) => {
      await tx.profile.update({
        where: {
          userId,
        },
        data: {
          skills: {
            connect: skills.map((skill) => ({
              id: skill.id,
            })),
          },
        },
      });

      await tx.userOnboarding.update({
        where: {
          userId,
        },
        data: {
          skillsCompleted: true,
          currentStep: OnboardingStep.EDUCATION,
        },
      });
    });

    return {
      success: true,
      message: 'Skills added successfully.',
      nextStep: OnboardingStep.EDUCATION,
    };
  }

  async addEducationInfo(data: AddEducationInfoDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const onboarding = await this.prismaService.userOnboarding.findUnique({
      where: {
        userId,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found.');

    if (onboarding.currentStep !== OnboardingStep.EDUCATION)
      throw new BadRequestException(
        'Please complete the previous step before proceeding.',
      );

    await this.prismaService.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: {
          userId,
        },
      });

      if (!profile) throw new NotFoundException('Profile not found.');

      const educations: Education[] = [];

      for (const education of data.educations) {
        const createdEducation = await tx.education.create({
          data: {
            profileId: profile.id,
            institution: education.institution,
            degree: education.degree,
            fieldOfStudy: education.fieldOfStudy,
            startDate: education.startDate,
            endDate: education.endDate,
            grade: education.grade,
            description: education.description,
            isCurrentlyStudying: education.isCurrentlyStudying,
          },
        });

        educations.push(createdEducation);
      }

      await tx.profile.update({
        where: {
          userId,
        },
        data: {
          educations: {
            connect: educations.map((education) => ({
              id: education.id,
            })),
          },
        },
      });

      await tx.userOnboarding.update({
        where: {
          userId,
        },
        data: {
          educationInfoCompleted: true,
          currentStep: OnboardingStep.AVAILABILITY,
        },
      });
    });

    return {
      success: true,
      message: 'Education information added successfully.',
      nextStep: OnboardingStep.AVAILABILITY,
    };
  }

  async addAvailabilityInfo(data: AddAvailabilityInfoDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const onboarding = await this.prismaService.userOnboarding.findUnique({
      where: {
        userId,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found.');

    if (onboarding.currentStep !== OnboardingStep.AVAILABILITY)
      throw new BadRequestException(
        'Please complete the previous step before proceeding.',
      );

    await this.prismaService.$transaction(async (tx) => {
      await tx.profile.update({
        where: {
          userId,
        },
        data: {
          isOpenToWork: data.isOpenToWork,
          isOpenToCollaborate: data.isOpenToCollaborate,
        },
      });

      await tx.userOnboarding.update({
        where: {
          userId,
        },
        data: {
          availabilityInfoCompleted: true,
          currentStep: OnboardingStep.COMPLETED,
          completedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      message: 'Availability information added successfully.',
      nextStep: OnboardingStep.COMPLETED,
    };
  }
}
