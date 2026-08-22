import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationInviteActionsController } from './organization-invite-actions.controller';

describe('OrganizationInviteActionsController', () => {
  let controller: OrganizationInviteActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationInviteActionsController],
    }).compile();

    controller = module.get<OrganizationInviteActionsController>(
      OrganizationInviteActionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
