import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or, and } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import * as schema from '../../drizzle/schema';

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async findById(id: string) {
    const [result] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return result || null;
  }

  async findUniqueByEmail(email: string) {
    const [result] = await this.db.select().from(schema.users).where(eq(schema.users.email, email));
    return result || null;
  }

  async findFirstByEmailOrAlias(email: string, alias: string) {
    const [result] = await this.db
      .select()
      .from(schema.users)
      .where(or(eq(schema.users.email, email), eq(schema.users.alias, alias)));
    return result || null;
  }

  async create(data: typeof schema.users.$inferInsert) {
    const [result] = await this.db.insert(schema.users).values(data).returning({
        id: schema.users.id,
        email: schema.users.email,
        alias: schema.users.alias,
        role: schema.users.role,
    });
    return result;
  }

  async findByToken(verificationToken: string) {
    const [result] = await this.db.select().from(schema.users).where(eq(schema.users.verificationToken, verificationToken));
    return result || null;
  }

  async update(id: string, data: Partial<typeof schema.users.$inferInsert>) {
    const [result] = await this.db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
    return result;
  }

  async update2faCode(id: string, code: string, expiresAt: Date) {
    return this.update(id, { twoFactorCode: code, twoFactorExpiresAt: expiresAt });
  }

  async clear2faCode(id: string) {
    return this.update(id, { twoFactorCode: null, twoFactorExpiresAt: null });
  }

  async findKnownDevice(userId: string, deviceFingerprint: string) {
    const [result] = await this.db
      .select()
      .from(schema.knownDevice)
      .where(and(eq(schema.knownDevice.userId, userId), eq(schema.knownDevice.deviceFingerprint, deviceFingerprint)));
    return result || null;
  }

  async createKnownDevice(userId: string, deviceFingerprint: string) {
    const [result] = await this.db.insert(schema.knownDevice).values({ userId, deviceFingerprint }).returning();
    return result;
  }

  async verifyEmail(token: string) {
    const [result] = await this.db
      .update(schema.users)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(schema.users.verificationToken, token))
      .returning();
    return result;
  }
}
