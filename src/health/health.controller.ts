import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Verifica a saúde do sistema' })
  check() {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    const timeoutMs = 5000;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database check timed out')), timeoutMs),
    );

    try {
      await Promise.race([
        this.db.execute(sql`SELECT 1`),
        timeoutPromise,
      ]);

      return { database: { status: 'up' } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database ping failed';
      return { database: { status: 'down', message } };
    }
  }
}