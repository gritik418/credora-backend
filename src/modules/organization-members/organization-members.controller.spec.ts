import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationMembersController } from './organization-members.controller';

describe('OrganizationMembersController', () => {
  let controller: OrganizationMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationMembersController],
    }).compile();

    controller = module.get<OrganizationMembersController>(OrganizationMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
