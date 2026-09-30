import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import * as schema from '../../drizzle/schema';

@Injectable()
export class PasswordResetRepository {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async create(userId: string, token: string, expiresAt: Date) {
    const [result] = await this.db.insert(schema.passwordReset).values({ userId, token, expiresAt }).returning();
    return result;
  }

  async findByToken(token: string) {
    const [result] = await this.db
      .select({
        id: schema.passwordReset.id,
        userId: schema.passwordReset.userId,
        token: schema.passwordReset.token,
        expiresAt: schema.passwordReset.expiresAt,
        usedAt: schema.passwordReset.usedAt,
        createdAt: schema.passwordReset.createdAt,
        user: schema.users,
      })
      .from(schema.passwordReset)
      .leftJoin(schema.users, eq(schema.passwordReset.userId, schema.users.id))
      .where(eq(schema.passwordReset.token, token));
    return result || null;
  }

  async markAsUsed(id: string) {
    const [result] = await this.db
      .update(schema.passwordReset)
      .set({ usedAt: new Date() })
      .where(eq(schema.passwordReset.id, id))
      .returning();
    return result;
  }
}
