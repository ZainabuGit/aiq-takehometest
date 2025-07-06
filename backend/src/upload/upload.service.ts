import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand , GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

    async uploadFromS3(): Promise<{ message: string }> {
        const bucket = process.env.S3_BUCKET_NAME;
        if (!bucket) throw new Error("Missing S3_BUCKET_NAME environment variable.");

        const listCommand = new ListObjectsV2Command({ Bucket: bucket });
        const listResponse = await this.s3.send(listCommand);

        const files = listResponse.Contents || [];
        const allResults: PowerPlant[] = [];

        for (const file of files) {
            const key = file.Key;
            if (!key) continue;

            try {
                const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
                const response = await this.s3.send(getCommand);
                const stream = response.Body as Readable;

                const results: PowerPlant[] = await new Promise((resolve, reject) => {
                    const temp: PowerPlant[] = [];

                    stream
                        .pipe(csv())
                        .on("data", (data) => {
                            // if (allResults.length === 0) {
                            //     console.log("🔍 First row keys:", Object.keys(data));
                            // }
                            try {
                                const name = (data["Plant name"] || "").trim();
                                const state = (data["Plant state abbreviation"] || "").trim().toUpperCase();
                                const rawNetGen = (data["Generator annual net generation (MWh)"] || "").toString().replace(/,/g, "");

                                if (!name || !state || isNaN(parseFloat(rawNetGen))) return;
                                const netGeneration = parseFloat(rawNetGen);

                                console.log('name' + name);
                                console.log('state' + state);
                                console.log('rawGen' + rawNetGen);

                                temp.push({ name, state, netGeneration });
                            } catch (err) {
                                console.warn(`Skipping malformed row in file ${key}:`, err);
                            }
                        })
                        .on("end", () => resolve(temp))
                        .on("error", (err) => reject(err));
                });

                allResults.push(...results);
                console.log(`Processed ${results.length} records from ${key}`);
            } catch (err) {
                console.error(`Failed to process file ${key}:`, err);
            }
        }

        const existing = this.powerplantService.getPlants();
        this.powerplantService.setPlants([...existing, ...allResults]);

        return { message: `${allResults.length} total records loaded from S3.` };
    }
}
