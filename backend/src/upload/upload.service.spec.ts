import { S3Service } from './upload.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Readable } from 'stream';

// mock CSV parser to just forward raw objects through stream
jest.mock('csv-parser', () => () => require('stream').Transform({ objectMode: true }));

describe('S3Service', () => {
  let service: S3Service;
  let mockSend: jest.Mock;

  const mockPowerplantService = {
    getPlants: jest.fn().mockReturnValue([]),
    setPlants: jest.fn(),
  };

  beforeEach(() => {
    service = new S3Service(mockPowerplantService as any);
    mockSend = jest.fn();
    service['s3'].send = mockSend;
    process.env.S3_BUCKET_NAME = 'test-bucket';
  });

  describe('uploadFile', () => {
    it('should upload file and return key', async () => {
      const mockFile = {
        originalname: 'plants.csv',
        buffer: Buffer.from('test-content'),
        mimetype: 'text/csv',
      } as Express.Multer.File;

      mockSend.mockResolvedValueOnce({}); // simulate successful PutObjectCommand

      const result = await service.uploadFile(mockFile);
      expect(result).toHaveProperty('message', 'File uploaded successfully');
      expect(result).toHaveProperty('key');
    });

    it('should throw InternalServerErrorException on upload error', async () => {
      mockSend.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
          service.uploadFile({} as Express.Multer.File),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('uploadFromS3', () => {
    it('should process CSVs and load records', async () => {
      const mockCSVRows = [
        { 'Plant name': 'Alpha', State: 'tx', 'Net generation (MWh)': '1500' },
        { 'Plant name': 'Beta', State: 'ca', 'Net generation (MWh)': 'bad-data' }, // skipped
      ];

      // 1. List objects in bucket
      mockSend.mockResolvedValueOnce({
        Contents: [{ Key: 'data.csv' }],
      });

      // 2. Stream CSV data from S3
      const stream = new Readable({
        objectMode: true,
        read() {
          mockCSVRows.forEach((row) => this.push(row));
          this.push(null); // end stream
        },
      });

      mockSend.mockResolvedValueOnce({ Body: stream });

      const result = await service.uploadFromS3();

      expect(result.message).toContain('1 total records loaded');
      expect(mockPowerplantService.setPlants).toHaveBeenCalledWith([
        { name: 'Alpha', state: 'TX', netGeneration: 1500 },
      ]);
    });

    it('should handle S3 errors and still continue', async () => {
      // simulate S3 listing but GetObject fails
      mockSend
          .mockResolvedValueOnce({ Contents: [{ Key: 'bad.csv' }] })
          .mockRejectedValueOnce(new Error('S3 read error'));

      const result = await service.uploadFromS3();
      expect(result.message).toContain('0 total records loaded');
    });
  });
});
