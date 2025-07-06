import {
    Controller,
    Post,
    Get,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { S3Service } from './upload.service';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
    constructor(private readonly s3Service: S3Service) {}

    @Post('uploadtoS3')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file to S3' })
    @ApiResponse({ status: 200, description: 'File uploaded successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
    @ApiResponse({ status: 500, description: 'Upload failed', type: ErrorResponseDto })
    async uploadToS3(@UploadedFile() file: Express.Multer.File) {
        return await this.s3Service.uploadFile(file);
    }

    @Get('uploadFromS3')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Read and load all CSV files from S3 into memory' })
    @ApiResponse({ status: 200, description: 'Records loaded from S3' })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
    @ApiResponse({ status: 500, description: 'S3 sync failed', type: ErrorResponseDto })
    async uploadFromS3() {
        return this.s3Service.uploadFromS3();
    }
}
