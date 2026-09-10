export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  provider: 'resend' | 'brevo';
  messageId?: string;
  error?: string;
  statusCode?: number;
}

export interface ProviderConnectionResult {
  success: boolean;
  provider: 'resend' | 'brevo';
  message: string;
  details?: Record<string, unknown>;
}

export interface EmailProviderAdapter {
  readonly name: 'resend' | 'brevo';
  isConfigured(): boolean;
  testConnection(): Promise<ProviderConnectionResult>;
  sendEmail(payload: SendEmailPayload): Promise<SendEmailResult>;
}
