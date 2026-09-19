import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailOrchestrator } from '../services/mail.orchestrator';
import { MailOptions } from '../interfaces/mail.interfaces';
import { TemplateService } from '../services/template.service';
import * as Sentry from '@sentry/nestjs';

@Processor('mail', {
  drainDelay: 60, // 60 segundos de espera quando a fila esvaziar
  stalledInterval: 60000, // Verificar jobs travados a cada 1 minuto
  lockDuration: 300000, // Aumenta o tempo do lock (5 min) para evitar renovações constantes
})
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private mailOrchestrator: MailOrchestrator,
    private templateService: TemplateService,
  ) {
    super();
  }

  // Intercepta erros globais do Worker
  @OnWorkerEvent('error')
  onError(err: Error) {
    if (err.message?.includes('max requests limit exceeded')) {
      this.logger.error('Limite do Upstash atingido. Pausando o worker para parar o loop...');
      
      // Pausa a execução do Worker para interromper o polling
      // @ts-ignore: Accessing worker directly
      this.worker.pause();
    }
  }

  async process(job: Job<MailOptions, any, string>): Promise<any> {
    const { requestId } = job.data;

    return Sentry.withScope(async (scope) => {
      if (requestId) {
        scope.setTag('requestId', requestId);
      }

      this.logger.log(
        { requestId },
        `Processing job ${job.id} for ${job.data.to}...`,
      );

      try {
        const html = await this.templateService.render(
          job.data.template,
          job.data.context,
        );

        await this.mailOrchestrator.send({
          ...job.data,
          html,
        });

        this.logger.log({ requestId }, `Successfully processed job ${job.id}`);
      } catch (error) {
        this.logger.error(
          { requestId },
          `Failed to process job ${job.id}: ${error.message}`,
        );
        throw error;
      }
    });
  }
}
