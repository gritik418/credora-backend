import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceMembersController } from './workspace-members.controller';

describe('WorkspaceMembersController', () => {
  let controller: WorkspaceMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceMembersController],
    }).compile();

    controller = module.get<WorkspaceMembersController>(WorkspaceMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
