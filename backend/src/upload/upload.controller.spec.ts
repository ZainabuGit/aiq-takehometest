import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { S3Service } from './upload.service';
import { AuthGuard } from '@nestjs/passport';
import { InternalServerErrorException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let s3Service: S3Service;

  const mockS3Service = {
    uploadFile: jest.fn(),
    uploadFromS3: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: S3Service, useValue: mockS3Service }],
    })
        .overrideGuard(AuthGuard('jwt'))
        .useValue({ canActivate: () => true }) // bypass JWT auth
        .compile();

    controller = module.get<UploadController>(UploadController);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadToS3', () => {
    it('should return success response when upload succeeds', async () => {
      const mockFile = {
        originalname: 'test.csv',
        buffer: Buffer.from('some content'),
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockResponse = { message: 'File uploaded successfully', key: 'abc.csv' };

      mockS3Service.uploadFile.mockResolvedValue(mockResponse);

      const result = await controller.uploadToS3(mockFile);
      expect(s3Service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should throw InternalServerErrorException when upload fails', async () => {
      const error = new InternalServerErrorException('Upload failed');
      mockS3Service.uploadFile.mockRejectedValue(error);

      await expect(controller.uploadToS3({} as Express.Multer.File)).rejects.toThrow(
          InternalServerErrorException
      );
    });
  });

  describe('uploadFromS3', () => {
    it('should return message when sync succeeds', async () => {
      const mockResult = { message: '100 records loaded' };
      mockS3Service.uploadFromS3.mockResolvedValue(mockResult);

      const result = await controller.uploadFromS3();
      expect(result).toEqual(mockResult);
    });

    it('should throw error when sync fails', async () => {
      const error = new Error('Sync failed');
      mockS3Service.uploadFromS3.mockRejectedValue(error);

      await expect(controller.uploadFromS3()).rejects.toThrow('Sync failed');
    });
  });
});
