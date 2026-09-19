import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './services/mail.service';
import { MailOrchestrator } from './services/mail.orchestrator';
import { MailProcessor } from './queues/mail.processor';
import { TemplateService } from './services/template.service';

import { bullConfigFactory } from './factories/bull-config.factory';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: bullConfigFactory,
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [],
  providers: [MailService, MailOrchestrator, MailProcessor, TemplateService],
  exports: [MailService],
})
export class MailModule {}
