import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAuthController } from './auth.controller';

describe('OrganizationAuthController', () => {
  let controller: OrganizationAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationAuthController],
    }).compile();

    controller = module.get<OrganizationAuthController>(
      OrganizationAuthController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
