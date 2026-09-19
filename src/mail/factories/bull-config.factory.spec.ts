import { ConfigService } from '@nestjs/config';
import { bullConfigFactory } from './bull-config.factory';

describe('bullConfigFactory', () => {
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;
  });

  it('should return url connection if REDIS_URL is provided', () => {
    configService.get.mockReturnValueOnce(false); // REDIS_USE_LOCAL
    configService.get.mockReturnValueOnce('redis://localhost:6379'); // REDIS_URL

    const result = bullConfigFactory(configService);

    expect(result.connection).toHaveProperty('url', 'redis://localhost:6379');
    expect(result.connection).toHaveProperty('maxRetriesPerRequest', null);
  });

  it('should return tls options if REDIS_URL starts with rediss://', () => {
    configService.get.mockReturnValueOnce(false); // REDIS_USE_LOCAL
    configService.get.mockReturnValueOnce('rediss://localhost:6379'); // REDIS_URL
    configService.get.mockReturnValueOnce('remotehost'); // REDIS_HOST

    const result = bullConfigFactory(configService);

    expect(result.connection).toHaveProperty('tls');
  });

  it('should return host and port if REDIS_URL is not provided', () => {
    configService.get.mockReturnValueOnce(false); // REDIS_USE_LOCAL
    configService.get.mockReturnValueOnce(undefined); // REDIS_URL
    configService.get.mockReturnValueOnce('localhost'); // REDIS_HOST
    configService.get.mockReturnValueOnce(6379); // REDIS_PORT

    const result = bullConfigFactory(configService);

    expect(result.connection).toHaveProperty('host', 'localhost');
    expect(result.connection).toHaveProperty('port', 6379);
  });
});
