import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { DomainError } from '../domain/errors/domain.error';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof DomainError) {
      httpStatus = exception.statusCode;
      message = exception.message;
      errorCode = exception.errorCode;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      const responseBody =
        typeof response === 'object' && response !== null
          ? (response as Record<string, any>)
          : { message: response };
      message = responseBody.message || exception.message;
      errorCode = responseBody.error || 'HTTP_ERROR';
    } else if ((exception as any)?.code && (exception as any)?.code.startsWith('23')) {
      // Postgres error codes starting with 23 are constraint violations
      const error = exception as any;
      switch (error.code) {
        case '23505':
          httpStatus = HttpStatus.CONFLICT;
          message = 'O registro já existe.';
          errorCode = 'UNIQUE_CONSTRAINT_FAILED';
          break;
        case '23503': // Foreign key violation
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Erro de violação de chave estrangeira.';
          errorCode = 'FOREIGN_KEY_VIOLATION';
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Erro na operação de banco de dados.';
          errorCode = `DATABASE_ERROR_${error.code}`;
      }
    }

    // Evita sobrecarregar a APM/Sentry com erros operacionais do cliente (4xx) registrando apenas falhas não tratadas do servidor (5xx)
    if (httpStatus >= (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      Sentry.captureException(exception);

      this.logger.error(
        `Path: ${request.url} | Method: ${request.method} | Error: ${
          exception instanceof Error
            ? exception.stack
            : JSON.stringify(exception)
        }`,
      );
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
      errorCode,
      requestId: request.headers['x-request-id'] as string | undefined,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}