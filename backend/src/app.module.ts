import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PowerplantModule } from './powerplant/powerplant.module';
import { AuthModule } from './auth/auth.module';
import { S3Service } from './upload/upload.service';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [PowerplantModule, AuthModule, UploadModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, UploadController],
  providers: [AppService, S3Service],
})
export class AppModule {}
