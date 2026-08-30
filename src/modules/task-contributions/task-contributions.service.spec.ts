import { Test, TestingModule } from '@nestjs/testing';
import { TaskContributionsService } from './task-contributions.service';

describe('TaskContributionsService', () => {
  let service: TaskContributionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskContributionsService],
    }).compile();

    service = module.get<TaskContributionsService>(TaskContributionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
