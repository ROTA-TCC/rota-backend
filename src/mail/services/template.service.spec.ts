import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import * as fs from 'fs';
import * as ejs from 'ejs';

jest.mock('fs');
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

  it('should compile template with context', async () => {
    const templateContent = '<h1>Welcome <%= name %></h1>';
    const compiledOutput = '<h1>Welcome User</h1>';

    (fs.readFileSync as jest.Mock).mockReturnValue(templateContent);
    (ejs.render as jest.Mock).mockReturnValue(compiledOutput);

    const result = await service.compile('welcome', { name: 'User' });

    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('welcome'),
      'utf-8',
    );
    expect(ejs.render).toHaveBeenCalledWith(templateContent, { name: 'User' });
    expect(result).toBe(compiledOutput);
  });

  it('should throw exception when template file does not exist', async () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    await expect(service.compile('missing-template', {})).rejects.toThrow(
      'ENOENT: no such file or directory',
    );
  });
});
