import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionValidatorPolicy } from '../policies/session-validator.policy';
import { nanoid } from 'nanoid';

import { IpAddress } from '../../common/domain/value-objects/ip-address.vo';
import { UserAgent } from '../../common/domain/value-objects/user-agent.vo';

import { SessionRepository } from '../repositories/session.repository';

@Injectable()
export class SessionService {
  private readonly REFRESH_TOKEN_DAYS = 7;
  private readonly REMEMBER_ME_DAYS = 30;

  constructor(
    private repository: SessionRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(
    userId: string,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean,
    role: string,
    isVerified: boolean,
  ) {
    const expiresAt = this.calculateExpiration(rememberMe);
    const refreshToken = nanoid(64);

    await this.repository.create({
      userId,
      refreshToken,
      ipAddress: new IpAddress(ipAddress).toString(),
      userAgent: new UserAgent(userAgent).toString(),
      expiresAt,
    });

    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return {
      accessToken: this.jwtService.sign(
        { sub: userId, role, isVerified },
        { secret, expiresIn: '15m' },
      ),
      refreshToken,
      expiresAt,
    };
  }

  async refresh(oldToken: string, userAgent: string) {
    const session = await this.repository.findUniqueWithUser(oldToken);
    SessionValidatorPolicy.validate(
      session,
      new UserAgent(userAgent).toString(),
    );

    const newRefreshToken = nanoid(64);
    const expiresAt = this.calculateExpiration(false);

    await this.repository.update(session.id, {
      refreshToken: newRefreshToken,
      expiresAt,
    });

    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const user = session.user;

    return {
      accessToken: this.jwtService.sign(
        {
          sub: session.userId,
          role: user?.role,
          isVerified: user?.isVerified,
        },
        { secret, expiresIn: '15m' },
      ),
      refreshToken: newRefreshToken,
      expiresAt,
      user: session.user,
    };
  }

  private calculateExpiration(rememberMe: boolean): Date {
    const days = rememberMe ? this.REMEMBER_ME_DAYS : this.REFRESH_TOKEN_DAYS;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async list(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async revokeSession(sessionId: string, userId: string) {
    return this.repository.delete(sessionId, userId);
  }
  async revokeAllOthers(userId: string, currentSessionId: string) {
    return this.repository.deleteOthers(userId, currentSessionId);
  }

  async revokeAll(userId: string) {
    return this.repository.deleteAllByUserId(userId);
  }
}
