import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Swagger config
  const config = new DocumentBuilder()
      .setTitle('Power Plant API')
      .setDescription('API to get top power plants by generation')
      .setVersion('1.0')
      .addTag('powerplants')
      .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            in: 'header',
          },
          'access-token', // <-- reference name
      )
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  await app.listen(8000);
}
bootstrap();
