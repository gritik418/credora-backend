import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationInvitesService } from './invites.service';

describe('OrganizationInvitesService', () => {
  let service: OrganizationInvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationInvitesService],
    }).compile();

    service = module.get<OrganizationInvitesService>(
      OrganizationInvitesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
