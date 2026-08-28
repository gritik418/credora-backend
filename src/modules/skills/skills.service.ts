import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllSkills(req: Request, searchQuery?: string | undefined) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const skills = await this.prismaService.skill.findMany({
      where: searchQuery
        ? {
            OR: [
              {
                name: {
                  contains: searchQuery?.toLowerCase(),
                },
              },
              {
                slug: {
                  contains: searchQuery?.toLowerCase(),
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      message: 'Skills fetched successfully.',
      skills: skills,
    };
  }
}
