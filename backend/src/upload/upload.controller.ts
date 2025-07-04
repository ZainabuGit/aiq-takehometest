import {
    Controller,
    Post,
    Get,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { S3Service } from './upload.service';
import { ApiBearerAuth, ApiConsumes, ApiTags, ApiOperation , ApiQuery , ApiResponse } from '@nestjs/swagger';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
    constructor(private readonly s3Service: S3Service) {}

    @Post('uploadtoS3')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    async uploadToS3(@UploadedFile() file: Express.Multer.File) {
        return await this.s3Service.uploadFile(file);
    }

    @Get('uploadFromS3')
    @ApiOperation({ summary: 'Load a CSV file from S3 and store it in memory' })
    @ApiQuery({ name: 'key', required: true, description: 'S3 file key (e.g. gen23.csv)' })
    @ApiResponse({ status: 200, description: 'Records loaded from S3' })
    async uploadFromS3(@Query('key') key: string) {
        return this.s3Service.uploadFromS3(key);
    }
}
