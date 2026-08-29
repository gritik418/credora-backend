import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import UpdateUsernameSchema from './schemas/update-username.schema';
import UpdateUsernameDto from './dto/update-username.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    return this.usersService.getMe(req);
  }

  @Patch('username')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UpdateUsernameSchema))
  async updateUsername(@Body() data: UpdateUsernameDto, @Req() req: Request) {
    return this.usersService.updateUsername(data, req);
  }
}
