import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const configService = app.get(ConfigService);

  app.use(
    cors({
      origin: [configService.get('CLIENT_ORIGIN')],
    }),
  );

  const port = configService.get('PORT');

  if (configService.get('NODE_ENV') === 'dev') {
    const swaggerConfig = new DocumentBuilder().setTitle('Mafia322').build();
    // .addBearerAuth()
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerDocument);
  }

  await app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
  });
}
bootstrap();
