import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HealthCheckError,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
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
        this.prisma.$queryRaw`SELECT 1`,
        timeoutPromise,
      ]);

      return { database: { status: 'up' } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database ping failed';

      throw new HealthCheckError('Database check failed', {
        database: { status: 'down', message },
      });
    }
  }
}
