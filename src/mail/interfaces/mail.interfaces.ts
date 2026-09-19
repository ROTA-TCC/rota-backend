export interface MailOptions {
  to: string;
  subject: string;
  template: string;
  html?: string;
  context: Record<string, any>;
  requestId?: string;
}
