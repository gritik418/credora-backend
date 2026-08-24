import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersController } from './project-members.controller';

describe('ProjectMembersController', () => {
  let controller: ProjectMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectMembersController],
    }).compile();

    controller = module.get<ProjectMembersController>(ProjectMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
