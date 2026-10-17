import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionRequestsService } from './connection-requests.service';

describe('ConnectionRequestsService', () => {
  let service: ConnectionRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionRequestsService],
    }).compile();

    service = module.get<ConnectionRequestsService>(ConnectionRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
