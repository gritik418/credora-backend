import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationInvitesController } from './organization-invites.controller';

describe('OrganizationInvitesController', () => {
  let controller: OrganizationInvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationInvitesController],
    }).compile();

    controller = module.get<OrganizationInvitesController>(OrganizationInvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
