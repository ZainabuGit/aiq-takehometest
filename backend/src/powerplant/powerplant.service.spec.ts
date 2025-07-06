import { PowerplantService } from './powerplant.service';
import { PowerPlant } from './powerplant.interface';

describe('PowerplantService', () => {
  let service: PowerplantService;

  const samplePlants: PowerPlant[] = [
    { name: 'Plant A', state: 'TX', netGeneration: 500 },
    { name: 'Plant B', state: 'TX', netGeneration: 1000 },
    { name: 'Plant C', state: 'CA', netGeneration: 300 },
    { name: 'Plant D', state: 'CA', netGeneration: 800 },
    { name: 'Plant E', state: 'NY', netGeneration: 200 },
  ];

  beforeEach(() => {
    service = new PowerplantService();
    service.setPlants(samplePlants);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlants()', () => {
    it('should return all power plants', () => {
      const result = service.getPlants();
      expect(result.length).toBe(5);
      expect(result[0].name).toBe('Plant A');
    });
  });

  describe('getTopPlants()', () => {
    it('should return top 10 plants if no arguments passed', () => {
      const result = service.getTopPlants();
      expect(result.length).toBe(5); // only 5 in test data
      expect(result[0].name).toBe('Plant B'); // highest netGeneration
    });

    it('should return top 2 plants in correct order', () => {
      const result = service.getTopPlants(undefined, 2);
      expect(result.length).toBe(2);
      expect(result[0].netGeneration).toBeGreaterThan(result[1].netGeneration);
    });

    it('should filter by state and return sorted top N', () => {
      const result = service.getTopPlants('CA', 2);
      expect(result.length).toBe(2);
      expect(result[0].state).toBe('CA');
      expect(result[0].netGeneration).toBe(800);
      expect(result[1].netGeneration).toBe(300);
    });

    it('should handle lowercase state filter', () => {
      const result = service.getTopPlants('tx', 2);
      expect(result.length).toBe(2);
      expect(result.every(p => p.state === 'TX')).toBe(true);
    });

    it('should return empty array if no matching state', () => {
      const result = service.getTopPlants('FL', 2);
      expect(result).toEqual([]);
    });
  });
});
