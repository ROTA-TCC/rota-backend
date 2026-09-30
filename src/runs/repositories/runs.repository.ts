import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import * as schema from '../../drizzle/schema';

@Injectable()
export class RunsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) {}

  async create(data: typeof schema.runs.$inferInsert) {
    const [result] = await this.db.insert(schema.runs).values(data).returning();
    return result;
  }
}
