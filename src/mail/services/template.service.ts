import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class TemplateService {
  async render(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'dist',
      'mail',
      'templates',
      `${templateName}.ejs`,
    );
    return ejs.renderFile(templatePath, context);
  }
}
