import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase } from './login-user.use-case';
import { UserService } from '../../users/services/users.service';
import { SecurityService } from '../services/security.service';
import { TwoFactorService } from '../services/two-factor.service';
import { JwtService } from '@nestjs/jwt';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userService: UserService;
  let securityService: SecurityService;
  let twoFactorService: TwoFactorService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: UserService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: SecurityService,
          useValue: { comparePassword: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: TwoFactorService,
          useValue: {
            isNewDevice: jest.fn().mockResolvedValue(false),
            logDevice: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mocked-jwt-token') },
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userService = module.get<UserService>(UserService);
    securityService = module.get<SecurityService>(SecurityService);
    twoFactorService = module.get<TwoFactorService>(TwoFactorService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should authenticate user successfully', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hash',
      is2faEnabled: false,
    };
    (userService.findByEmail as jest.Mock).mockResolvedValue(user);

    const result = await useCase.execute(
      credentials,
      '127.0.0.1',
      'Mozilla/5.0',
    );

    expect(result.requires2fa).toBe(false);
    expect(result.accessToken).toBe('mocked-jwt-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
  });
});