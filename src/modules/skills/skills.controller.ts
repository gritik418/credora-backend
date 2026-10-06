import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { Request } from 'express';

@Controller('skills')
@UseGuards(AuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllSkills(
    @Req() req: Request,
    @Query('search') searchQuery?: string,
  ) {
    return this.skillsService.getAllSkills(req, searchQuery);
  }

  @Get('popular')
  @HttpCode(HttpStatus.OK)
  async getPopularSkills(@Req() req: Request) {
    return this.skillsService.getPopularSkills(req);
  }
}
