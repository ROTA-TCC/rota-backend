import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          useValue: { user: { findUnique: jest.fn() } },
        },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should hash and compare passwords correctly', async () => {
    const password = 'mySecretPassword';
    const hash = await service.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isMatch = await service.comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isNotMatch = await service.comparePassword('wrongPassword', hash);
    expect(isNotMatch).toBe(false);
  }, 10000);
});
