import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

// Polyfill necessário: JSON.stringify lança TypeError nativo ao serializar BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  // O Sentry exige interceptar os módulos nativos do Node.js antes da criação da instância do Nest
  if (process.env.ENABLE_SENTRY === 'true') {
    await import('./instrument.js');
  }

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  // Relaxamento pontual da CSP do Helmet para impedir o bloqueio de scripts inline do Swagger UI
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `'unsafe-inline'`, 'https:'],
        },
      },
    }),
  );

  app.use(cookieParser());

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : true;

  app.enableCors({
    credentials: true,
    origin: allowedOrigins,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Plataforma Backend API')
    .setDescription(
      `
      API de Autenticação e Gerenciamento de Segurança.
      
      ### Regras de Negócio:
      * **Autenticação**: Suporta JWT via Header (Bearer) e Refresh Token via HttpOnly Cookie.
      * **Segurança**: Detecção de novos dispositivos e 2FA obrigatório para logins suspeitos.
      * **Sessões**: Controle total sobre sessões ativas com possibilidade de revogação remota.
    `,
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o Access Token obtido no login.',
    })
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh Token enviado automaticamente via cookie.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Documentação API - Backend',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();