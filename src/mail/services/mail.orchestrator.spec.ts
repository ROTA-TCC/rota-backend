import { Test, TestingModule } from '@nestjs/testing';
import { MailOrchestrator } from './mail.orchestrator';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailOrchestrator', () => {
  let orchestrator: MailOrchestrator;
  let configService: Partial<ConfigService>;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_PORT: '587',
          SMTP_USER: 'test@domain.com',
          SMTP_PASS: 'password',
          SMTP_FROM_EMAIL: 'noreply@domain.com',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailOrchestrator,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    orchestrator = module.get<MailOrchestrator>(MailOrchestrator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  it('should dispatch email with correct payload', async () => {
    const mailOptions = {
      to: 'user@example.com',
      subject: 'Security Alert',
      html: '<p>New login detected</p>',
      context: { alias: 'TestUser' },
    };

    await orchestrator.send(mailOptions);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@domain.com',
        to: 'user@example.com',
        subject: 'Security Alert',
        text: 'Hello TestUser!',
        html: '<p>New login detected</p>',
      }),
    );
  });

  it('should throw exception when transporter fails', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP Connection Failed'));

    await expect(
      orchestrator.send({
        to: 'user@example.com',
        subject: 'Test',
        html: 'Content',
        context: { alias: 'TestUser' },
      }),
    ).rejects.toThrow('Email sending failed.');
  });
});
