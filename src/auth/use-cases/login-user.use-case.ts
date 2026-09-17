import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../users/services/users.service';
import { SecurityService } from '../services/security.service';
import { TwoFactorService } from '../services/two-factor.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '@ROTA-TCC/types';
import { Email } from '../../common/domain/value-objects/email.vo';
import { Password } from '../../common/domain/value-objects/password.vo';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly securityService: SecurityService,
    private readonly twoFactorService: TwoFactorService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    credentials: LoginDto,
    ipAddress: string,
    userAgent: string,
    requestId?: string,
  ) {
    const email = new Email(credentials.email);
    const password = new Password(credentials.password);

    const user = await this.userService.findByEmail(email.toString());

    if (
      !user ||
      !(await this.securityService.comparePassword(
        password.toString(),
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.is2faEnabled) {
      await this.twoFactorService.generateAndSendCode(user);
      return {
        requires2fa: true,
        partialToken: this.jwtService.sign(
          { sub: user.id },
          { expiresIn: '5m' },
        ),
      };
    }

    const isNewDevice = await this.twoFactorService.isNewDevice(
      user.id,
      userAgent,
    );

    if (isNewDevice) {
      await this.twoFactorService.logDevice(user.id, userAgent);
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email.toString(),
    });

    return {
      requires2fa: false,
      accessToken,
    };
  }
}
