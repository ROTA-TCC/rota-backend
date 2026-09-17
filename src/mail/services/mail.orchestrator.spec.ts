import { Test, TestingModule } from '@nestjs/testing';
import { MailOrchestrator } from './mail.orchestrator';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailOrchestrator', () => {
  let orchestrator: MailOrchestrator;
  let configService: jest.Mocked < ConfigService > ;
  let sendMailMock: jest.Mock;
  
  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    
    configService = {
      get: jest.fn((key: string) => {
        const config: Record < string, string > = {
          MAIL_HOST: 'smtp.test.com',
          MAIL_PORT: '587',
          MAIL_USER: 'test@domain.com',
          MAIL_PASS: 'password',
          MAIL_FROM: 'noreply@domain.com',
        };
        return config[key];
      }),
    } as any;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailOrchestrator,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();
    
    orchestrator = module.get < MailOrchestrator > (MailOrchestrator);
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
    };
    
    await orchestrator.sendMail(mailOptions);
    
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Security Alert',
      }),
    );
  });
  
  it('should throw exception when transporter fails', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP Connection Failed'));
    
    await expect(
      orchestrator.sendMail({
        to: 'user@example.com',
        subject: 'Test',
        html: 'Content',
      }),
    ).rejects.toThrow('SMTP Connection Failed');
  });
});