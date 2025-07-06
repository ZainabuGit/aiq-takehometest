import { Test, TestingModule } from '@nestjs/testing';
import { PowerplantController } from './powerplant.controller';
import { PowerplantService } from './powerplant.service';
import { AuthGuard } from '@nestjs/passport';

describe('PowerplantController', () => {
  let controller: PowerplantController;
  let service: PowerplantService;

  const mockService = {
    getTopPlants: jest.fn((state: string, top: number) => [
      { name: 'Riverbend Power Station', generation: 123456 },
      { name: 'Sunrise Solar Plant', generation: 98765 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerplantController],
      providers: [
        {
          provide: PowerplantService,
          useValue: mockService,
        },
      ],
    })
        .overrideGuard(AuthGuard('jwt'))
        .useValue({ canActivate: () => true }) // Bypass auth
        .compile();

    controller = module.get<PowerplantController>(PowerplantController);
    service = module.get<PowerplantService>(PowerplantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /powerplants/test', () => {
    it('should return test message', () => {
      const result = controller.getTest();
      expect(result).toEqual({ message: 'Test successful' });
    });
  });

  describe('GET /powerplants', () => {
    it('should return top plants for given state and top value', () => {
      const state = 'TX';
      const top = 2;

      const response = controller.getTopPlants(state, top);
      expect(mockService.getTopPlants).toHaveBeenCalledWith(state, top);
      expect(response).toHaveLength(2);
      expect(response[0].name).toBe('Riverbend Power Station');
    });
  });
});
