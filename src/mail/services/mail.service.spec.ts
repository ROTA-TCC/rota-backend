import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('MailService', () => {
  let service: MailService;
  let queue: any;

  beforeEach(async () => {
    queue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('mail'),
          useValue: queue,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should add welcome email to queue', async () => {
    const email = 'test@example.com';
    const context = { alias: 'testuser', dashboardUrl: 'url', companyName: 'empresa' };

    await service.sendWelcomeEmail(email, context);

    expect(queue.add).toHaveBeenCalledWith(
      'welcome',
      {
        to: email,
        subject: 'Bem-vindo ao Nosso Sistema!',
        template: 'welcome',
        context,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  });
});
