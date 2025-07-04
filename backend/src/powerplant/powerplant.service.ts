import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
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

    // async loadCSV(filePath: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const results: PowerPlant[] = [];
    //
    //         fs.createReadStream(filePath)
    //             .pipe(csv())
    //             .on('data', (data) => {
    //                 try {
    //                     // Normalize and clean input data
    //                     const name = (data['Plant name'] || '').trim();
    //                     const state = (data['State'] || '').trim().toUpperCase();
    //                     const rawNetGen = data['Net generation (MWh)'] || '';
    //
    //                     // Skip invalid or incomplete rows
    //                     if (!name || !state || isNaN(parseFloat(rawNetGen))) {
    //                         console.warn('Skipping invalid row:', data);
    //                         return;
    //                     }
    //
    //                     const netGeneration = parseFloat(rawNetGen);
    //
    //                     results.push({
    //                         name,
    //                         state,
    //                         netGeneration,
    //                     });
    //                 } catch (error) {
    //                     console.error('Error processing row:', data, error);
    //                     // Optionally: log and skip malformed rows
    //                 }
    //             })
    //             .on('end', () => {
    //                 this.plants = results;
    //                 console.log(`CSV processed. Total valid records: ${results.length}`);
    //                 resolve();
    //             })
    //             .on('error', (err) => {
    //                 console.error('Error reading CSV file:', err);
    //                 reject(err);
    //             });
    //     });
    // }

    getTopPlants(state?: string, topN = 10): PowerPlant[] {
        let filtered = this.plants;
        if (state) {
            filtered = filtered.filter(p => p.state === state.toUpperCase());
        }
        return filtered
            .sort((a, b) => b.netGeneration - a.netGeneration)
            .slice(0, topN);
    }
}
