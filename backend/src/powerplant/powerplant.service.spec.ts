import { Test, TestingModule } from '@nestjs/testing';
import { PowerplantService } from './powerplant.service';

describe('PowerplantService', () => {
  let service: PowerplantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PowerplantService],
    }).compile();

    service = module.get<PowerplantService>(PowerplantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
