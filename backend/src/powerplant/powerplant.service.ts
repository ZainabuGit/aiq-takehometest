import { Injectable } from '@nestjs/common';
import { PowerPlant } from './powerplant.interface';

@Injectable()
export class PowerplantService {
    private plants: PowerPlant[] = [];

    setPlants(plants: PowerPlant[]): void {
        this.plants = plants;
    }

    getPlants(): PowerPlant[] {
        return this.plants;
    }

    getTopPlants(state?: string, topN = 10): PowerPlant[] {
        let filtered = this.plants;
        if (state) {
            filtered = filtered.filter(p => p.state === state.toUpperCase());
        }
        return filtered
            .sort((a, b) => b.netGeneration - a.netGeneration)
            .slice(0, topN);
    }

    getAllStates(): string[] {
        const states = new Set<string>();
        for (const plant of this.plants) {
            if (plant.state) {
                states.add(plant.state.toUpperCase());
            }
        }
        return Array.from(states).sort(); // return sorted list
    }

}
