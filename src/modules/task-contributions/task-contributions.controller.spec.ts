import { Test, TestingModule } from '@nestjs/testing';
import { TaskContributionsController } from './task-contributions.controller';

describe('TaskContributionsController', () => {
  let controller: TaskContributionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskContributionsController],
    }).compile();

    controller = module.get<TaskContributionsController>(TaskContributionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
