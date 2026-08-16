import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAuthService } from './auth.service';

describe('OrganizationAuthService', () => {
  let service: OrganizationAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationAuthService],
    }).compile();

    service = module.get<OrganizationAuthService>(OrganizationAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
