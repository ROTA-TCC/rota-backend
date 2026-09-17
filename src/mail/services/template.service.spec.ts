import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import * as ejs from 'ejs';

jest.mock('ejs');

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should render template with context', async () => {
    const compiledOutput = '<h1>Welcome User</h1>';
    (ejs.renderFile as jest.Mock).mockResolvedValue(compiledOutput);

    const result = await service.render('welcome', { name: 'User' });

    expect(ejs.renderFile).toHaveBeenCalledWith(
      expect.stringContaining('welcome.ejs'),
      { name: 'User' },
    );
    expect(result).toBe(compiledOutput);
  });

  it('should throw exception when renderFile fails', async () => {
    (ejs.renderFile as jest.Mock).mockRejectedValue(
      new Error('ENOENT: no such file or directory'),
    );

    await expect(service.render('missing-template', {})).rejects.toThrow(
      'ENOENT: no such file or directory',
    );
  });
});