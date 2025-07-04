import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { S3Service } from './upload.service';
import { PowerplantModule } from '../powerplant/powerplant.module';

@Module({
    imports: [PowerplantModule],
    controllers: [UploadController],
    providers: [S3Service],
})
export class UploadModule {}
