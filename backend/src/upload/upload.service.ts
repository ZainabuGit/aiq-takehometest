import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { PowerplantService } from '../powerplant/powerplant.service';
import { PowerPlant } from '../powerplant/powerplant.interface';

@Injectable()
export class S3Service {
    private s3 = new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });

    //  Store synced file keys to avoid duplicates
    private readonly syncedFiles = new Set<string>();

    constructor(private readonly powerplantService: PowerplantService) {}

    async uploadFile(file: Express.Multer.File) {
        const fileExt = path.extname(file.originalname);
        const key = `${uuidv4()}${fileExt}`;

        try {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME as string,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );
            return {
                message: 'File uploaded successfully',
                key,
            };
        } catch (err) {
            console.error('S3 upload failed:', err);
            throw new InternalServerErrorException('S3 upload failed');
        }
    }

    async uploadFromS3(): Promise<{ message: string }> {
        const bucket = process.env.S3_BUCKET_NAME;
        if (!bucket) throw new Error('Missing S3_BUCKET_NAME environment variable.');

        const listCommand = new ListObjectsV2Command({ Bucket: bucket });
        const listResponse = await this.s3.send(listCommand);

        const files = listResponse.Contents || [];
        const allResults: PowerPlant[] = [];
        let skippedFiles = 0;

        for (const file of files) {
            const key = file.Key;
            if (!key) continue;

            // Skip if already synced
            if (this.syncedFiles.has(key)) {
                console.log(` File already synced: ${key}`);
                skippedFiles++;
                continue;
            }

            try {
                const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
                const response = await this.s3.send(getCommand);
                const stream = response.Body as Readable;

                const results: PowerPlant[] = await new Promise((resolve, reject) => {
                    const temp: PowerPlant[] = [];

                    stream
                        .pipe(csv())
                        .on('data', (data) => {
                            try {
                                const name = (data['Plant name'] || '').trim();
                                const state = (data['Plant state abbreviation'] || '').trim().toUpperCase();
                                const rawNetGen = (data['Generator annual net generation (MWh)'] || '')
                                    .toString()
                                    .replace(/,/g, '');
                                const netGeneration = parseFloat(rawNetGen);

                                if (!name || !state || isNaN(netGeneration)) return;

                                temp.push({ name, state, netGeneration });
                            } catch (err) {
                                console.warn(` Skipping malformed row in ${key}`, err);
                            }
                        })
                        .on('end', () => resolve(temp))
                        .on('error', (err) => reject(err));
                });

                allResults.push(...results);
                this.syncedFiles.add(key); // ✅ Mark file as synced
                console.log(` Synced ${results.length} rows from: ${key}`);
            } catch (err) {
                console.error(` Failed to process file ${key}:`, err);
            }
        }

        // Merge with existing in-memory data
        const existing = this.powerplantService.getPlants();
        this.powerplantService.setPlants([...existing, ...allResults]);

        return {
            message: `${allResults.length} new records loaded. ${skippedFiles} file(s) were already synced.`,
        };
    }
}
