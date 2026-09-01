import { Test, TestingModule } from '@nestjs/testing';
import { ReviewRequestsService } from './review-requests.service';

describe('ReviewRequestsService', () => {
  let service: ReviewRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewRequestsService],
    }).compile();

    service = module.get<ReviewRequestsService>(ReviewRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
