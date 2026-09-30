import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { SessionRepository } from '../repositories/session.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('SessionService', () => {
  let service: SessionService;
  let repository: jest.Mocked<SessionRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: {
            create: jest.fn(),
            findUniqueWithUser: jest.fn(),
            update: jest.fn(),
            deleteManyByToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockAccessToken'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    repository = module.get(SessionRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a session successfully', async () => {
      const userId = 'user-1';
      const ipAddress = '127.0.0.1';
      const userAgent = 'Mozilla/5.0';

      const result = await service.create(
        userId,
        ipAddress,
        userAgent,
        false,
        'USER',
      );

      expect(repository.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw BadRequestException for invalid IP', async () => {
      await expect(
        service.create('u1', 'invalid-ip', 'ua', false, 'USER'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refresh', () => {
    it('should refresh a session successfully', async () => {
      const oldToken = 'old-refresh-token';
      const userAgent = 'Mozilla/5.0';
      const mockSession = {
        id: 's1',
        userId: 'u1',
        userAgent,
        expiresAt: new Date(Date.now() + 100000),
        user: { role: 'USER' },
      } as any;

      repository.findUniqueWithUser.mockResolvedValue(mockSession);
      repository.update.mockResolvedValue({ userId: 'u1' } as any);

      const result = await service.refresh(oldToken, userAgent);

      expect(repository.update).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if device changes', async () => {
      const mockSession = {
        id: 's1',
        userId: 'u1',
        userAgent: 'Other Browser',
        expiresAt: new Date(Date.now() + 100000),
        user: { role: 'USER' },
      } as any;

      repository.findUniqueWithUser.mockResolvedValue(mockSession);

      await expect(service.refresh('token', 'My Browser')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
