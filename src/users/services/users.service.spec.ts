import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { MailService } from '../../mail/services/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { RegisterDto } from '@ROTA-TCC/types';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findUniqueByEmail: jest.fn(),
            findFirstByEmailOrAlias: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findByToken: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
    mailService = module.get(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if email is valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as any;
      repository.findUniqueByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if email is invalid', async () => {
      await expect(service.findByEmail('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    const registrationData: RegisterDto = {
      email: 'new@example.com',
      alias: 'newuser',
      password: 'password123',
    };

    it('should create a user successfully', async () => {
      repository.findFirstByEmailOrAlias.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: '1',
        ...registrationData,
        role: 'USER',
      } as any);

      const result = await service.create(registrationData, 'hashedPassword');

      expect(repository.create).toHaveBeenCalled();
      expect(result.email).toBe(registrationData.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findFirstByEmailOrAlias.mockResolvedValue({
        email: registrationData.email,
      } as any);

      await expect(
        service.create(registrationData, 'hashedPassword'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = { id: '1', email: 'a@a.com' };
      repository.findById.mockResolvedValue(mockUser as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      repository.findByToken.mockResolvedValue({ id: '1' } as any);
      repository.update.mockResolvedValue({ id: '1', isVerified: true } as any);

      const result = await service.verifyEmail('token');
      expect(result.isVerified).toBe(true);
    });

    it('should throw NotFoundException for invalid token', async () => {
      repository.findByToken.mockResolvedValue(null);
      await expect(service.verifyEmail('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
