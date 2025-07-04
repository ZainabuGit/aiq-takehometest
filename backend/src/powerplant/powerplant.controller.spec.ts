import { Test, TestingModule } from '@nestjs/testing';
import { PowerplantController } from './powerplant.controller';

describe('PowerplantController', () => {
  let controller: PowerplantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerplantController],
    }).compile();

    controller = module.get<PowerplantController>(PowerplantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
