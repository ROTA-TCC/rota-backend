import { ConfigService } from '@nestjs/config';
import { getRedisConfig } from '../../common/utils/redis-config.util';

export const bullConfigFactory = (config: ConfigService) => {
  const redisConfig = getRedisConfig(config);
  
  const connection: any = {};

  if (redisConfig.url) {
    connection.url = redisConfig.url;
  } else if (redisConfig.socket) {
    connection.host = redisConfig.socket.host;
    connection.port = redisConfig.socket.port;
    connection.password = redisConfig.password;
  }

  if (redisConfig.socket?.tls) {
    connection.tls = { rejectUnauthorized: false };
  }

  return { 
    connection: { 
      ...connection, 
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times: number) {
        const delay = Math.min(times * 1000, 5000);
        return delay;
      }
    } 
  };
};
