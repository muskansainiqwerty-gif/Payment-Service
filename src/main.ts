import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

import { HttpExceptionFilter } from './common/error-handler/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as session from 'express-session';

declare const module: any;
const port = process.env.PORT || 3000;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_MQ],
      queue: 'madBusEmailQueue',
      noAck: false,
      prefetchCount: 1,
    },
  });
  await app.startAllMicroservices();
  await app.getMicroservices();

  app.set('trust proxy', true);
  app.enableCors();
  app.use(helmet());
  app.use(compression());
  app.setGlobalPrefix('game/api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(
    session({
      secret: 'r@nd0m$tr0ngS3cr3tKey!12345',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );
  app.set('trust proxy', true);
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Your API')
      .setDescription('The API description')
      .setVersion('1.0')
      .addTag('users')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: { enableImplicitConversion: true },
      transform: true,
    }),
  );
  console.log('app is working on port>', port);
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, '0.0.0.0');
  console.log(`Game service running on port = ${port}`);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
