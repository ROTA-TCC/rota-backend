import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ne } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import * as schema from '../../drizzle/schema';

@Injectable()
export class SessionRepository {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async create(data: typeof schema.sessions.$inferInsert) {
    const [result] = await this.db.insert(schema.sessions).values(data).returning();
    return result;
  }

  async findUniqueWithUser(refreshToken: string) {
    const [result] = await this.db
      .select({
        id: schema.sessions.id,
        userId: schema.sessions.userId,
        refreshToken: schema.sessions.refreshToken,
        ipAddress: schema.sessions.ipAddress,
        userAgent: schema.sessions.userAgent,
        expiresAt: schema.sessions.expiresAt,
        createdAt: schema.sessions.createdAt,
        updatedAt: schema.sessions.updatedAt,
        user: schema.users,
      })
      .from(schema.sessions)
      .leftJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(eq(schema.sessions.refreshToken, refreshToken));
    return result || null;
  }

  async update(id: string, data: Partial<typeof schema.sessions.$inferInsert>) {
    const [result] = await this.db.update(schema.sessions).set(data).where(eq(schema.sessions.id, id)).returning();
    return result;
  }

  async deleteManyByToken(refreshToken: string) {
    return await this.db.delete(schema.sessions).where(eq(schema.sessions.refreshToken, refreshToken));
  }

  async findByUserId(userId: string) {
    return await this.db
      .select({
        id: schema.sessions.id,
        userAgent: schema.sessions.userAgent,
        ipAddress: schema.sessions.ipAddress,
        createdAt: schema.sessions.createdAt,
        updatedAt: schema.sessions.updatedAt,
      })
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, userId));
  }

  async delete(id: string, userId: string) {
    return await this.db.delete(schema.sessions).where(and(eq(schema.sessions.id, id), eq(schema.sessions.userId, userId)));
  }

  async deleteOthers(userId: string, currentSessionId: string) {
    return await this.db.delete(schema.sessions).where(and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, currentSessionId)));
  }

  async deleteAllByUserId(userId: string) {
    return await this.db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  }
}
