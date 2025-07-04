import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand , GetObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
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

    async uploadFromS3(key: string): Promise<{ message: string }> {
        const bucket = process.env.S3_BUCKET_NAME;
        key = "sample_powerplants.csv";
        if (!bucket || !key) {
            throw new Error('Missing S3_BUCKET_NAME or key');
        }

        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await this.s3.send(command);
        const stream = response.Body as Readable;

        const results: PowerPlant[] = [];

        return new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (data) => {
                    try {
                        const name = (data['Plant name'] || '').trim();
                        const state = (data['State'] || '').trim().toUpperCase();
                        const rawNetGen = data['Net generation (MWh)'] || '';

                        if (!name || !state || isNaN(parseFloat(rawNetGen))) return;
                        const netGeneration = parseFloat(rawNetGen);

                        results.push({ name, state, netGeneration });
                    } catch (err) {
                        console.warn('Skipping malformed row:', err);
                    }
                })
                .on('end', () => {
                    const existing = this.powerplantService.getPlants();
                    this.powerplantService.setPlants([...existing, ...results]);
                    resolve({ message: `${results.length} records loaded from S3` });
                })
                .on('error', reject);
        });
    }
}
