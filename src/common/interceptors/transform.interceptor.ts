import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response as ExpressResponse } from 'express';

export interface Response < T > {
  success: boolean;
  data: T;
  message ? : string;
}

@Injectable()
export class TransformInterceptor < T > implements NestInterceptor <
  T,
  Response < T >
  >
  {
    intercept(context: ExecutionContext, next: CallHandler): Observable < any > {
      const response = context.switchToHttp().getResponse < ExpressResponse > ();
      
      return next.handle().pipe(
        map((data: unknown) => {
          if (Buffer.isBuffer(data)) {
            // Evita a serialização automática do NestJS para JSON em retornos binários sem cabeçalho explícito
            if (!response.getHeader('Content-Type')) {
              response.setHeader('Content-Type', 'application/octet-stream');
            }
            return data;
          }
          
          let message = 'Operation successful';
          let resultData = data;
          
          if (data && typeof data === 'object' && 'message' in data) {
            const { message: customMessage, ...rest } = data as Record <
              string,
              any >
            ;
            message = customMessage;
            resultData = rest;
          }
          
          return {
            success: true,
            message,
            data: resultData ?? {},
          };
        }),
      );
    }
  }