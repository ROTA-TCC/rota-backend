import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { timingSafeEqual, randomBytes } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import * as schema from '../../drizzle/schema';

@Injectable()
export class SecurityService {
  private readonly SALT_ROUNDS = 12;

  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async getSecurityStatus(userId: string) {
    const [user] = await this.db
      .select({ is2faEnabled: schema.users.is2faEnabled, email: schema.users.email, alias: schema.users.alias })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) throw new Error('User not found');
    return {
      email: user.email,
      alias: user.alias,
      is2faEnabled: user.is2faEnabled,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateRandomToken(bytes: number = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  }

  verifyDeviceFingerprint(currentAgent: string, storedAgent: string): boolean {
    return this.safeCompare(currentAgent, storedAgent);
  }
}
