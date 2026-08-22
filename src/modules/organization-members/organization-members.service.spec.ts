import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationMembersService } from './organization-members.service';

describe('OrganizationMembersService', () => {
  let service: OrganizationMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationMembersService],
    }).compile();

    service = module.get<OrganizationMembersService>(OrganizationMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
