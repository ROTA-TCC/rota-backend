import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';

export const bullConfigFactory = (config: ConfigService) => {
  const url = config.get<string>('REDIS_URL');

  if (url) {
    return { connection: getUrlConnectionOptions(url) };
  }

  return { connection: getHostConnectionOptions(config) };
};

function getUrlConnectionOptions(url: string): ConnectionOptions {
  const options: ConnectionOptions = {
    url,
    maxRetriesPerRequest: null,
  };

  if (url.startsWith('rediss://')) {
    options.tls = {
      rejectUnauthorized: false,
    };
  }

  return options;
}

function getHostConnectionOptions(config: ConfigService): ConnectionOptions {
  const host = config.get<string>('REDIS_HOST', 'localhost');
  const port = config.get<number>('REDIS_PORT', 6379);
  const password = config.get<string>('REDIS_PASSWORD');

  const options: ConnectionOptions = {
    host,
    port,
    password,
    maxRetriesPerRequest: null,
  };

  // Se não for localhost, habilitar TLS por padrão
  if (host !== 'localhost' && host !== '127.0.0.1') {
    options.tls = {
      rejectUnauthorized: false,
    };
  }

  return options;
}
