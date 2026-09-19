import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (config: ConfigService) => {
  const useLocal = config.get<string>('REDIS_USE_LOCAL') === 'true';
  const url = config.get<string>('REDIS_URL');

  if (useLocal) {
    return {
      socket: {
        host: 'localhost',
        port: 6379,
      },
    };
  }

  const host = config.get<string>('REDIS_HOST', 'localhost');
  const port = config.get<number>('REDIS_PORT', 6379);
  const password = config.get<string>('REDIS_PASSWORD');

  const configObj: any = url
    ? { url }
    : {
        socket: {
          host,
          port,
        },
        password,
      };

  // Se não for localhost, habilitar TLS por padrão
  if (host !== 'localhost' && host !== '127.0.0.1') {
    configObj.socket = { ...configObj.socket, tls: true };
  }

  return configObj;
};
