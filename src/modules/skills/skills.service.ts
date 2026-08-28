import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import SaveSkillsDto from './dto/save-skills.dto';

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

  async saveSkills(data: SaveSkillsDto, req: Request) {
    const userId: string = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const slugs = data.skills.map((skill) =>
      skill.toLowerCase().replace(/\s/g, ''),
    );

    const existingSkills = await this.prismaService.skill.findMany({
      where: {
        slug: { in: slugs },
      },
    });

    const newSkills = data.skills.filter(
      (skill) =>
        !existingSkills.some(
          (existingSkill) =>
            existingSkill.slug === skill.toLowerCase().replace(/\s/g, ''),
        ),
    );

    if (newSkills.length > 0) {
      const formattedSkills = newSkills.map((skill) => {
        return {
          name: skill,
          slug: skill.toLowerCase().replace(/\s/g, ''),
        };
      });

      await this.prismaService.skill.createMany({
        data: formattedSkills,
        skipDuplicates: true,
      });
    }

    const savedSkills = await this.prismaService.skill.findMany({
      where: {
        slug: { in: slugs },
      },
    });

    return {
      success: true,
      message: 'Skills saved successfully.',
      skills: savedSkills,
    };
  }
}
