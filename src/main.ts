import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Rejection Tracking API')
    .setDescription('API documentation for rejection tracking system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  console.log('Frontend URL from env:', process.env.FRONTEND_URL);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow if no origin (like mobile apps/curl) or if it matches our allowed list
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL?.replace(/\/$/, ''), // Remove trailing slash if any
        // 'http://localhost:5173',
        'http://localhost:3000',
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS Blocked: Origin ${origin} not in allowed list:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
