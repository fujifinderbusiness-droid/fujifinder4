import { EmailProviderAdapter, SendEmailPayload, SendEmailResult, ProviderConnectionResult } from './types';

export class ResendAdapter implements EmailProviderAdapter {
  readonly name = 'resend' as const;
  private apiKey: string;
  private defaultFromEmail: string;
  private defaultFromName: string;

  constructor(apiKey: string = '', defaultFromEmail = 'newsletter@fujifinder.my.id', defaultFromName = 'FujiFinder Editorial') {
    this.apiKey = apiKey.trim();
    this.defaultFromEmail = defaultFromEmail;
    this.defaultFromName = defaultFromName;
  }

  setApiKey(key: string) {
    this.apiKey = key.trim();
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async testConnection(): Promise<ProviderConnectionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'resend',
        message: 'Resend API key is not configured. Please set RESEND_API_KEY in your environment variables or in Admin Email Settings.',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/api-keys', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        return {
          success: true,
          provider: 'resend',
          message: 'Successfully authenticated with Resend API. API key is active and verified.',
        };
      }

      if (response.status === 401) {
        return {
          success: false,
          provider: 'resend',
          message: 'Authentication failed (401 Unauthorized): Invalid Resend API key. Please verify your RESEND_API_KEY.',
        };
      }

      const errText = await response.text();
      return {
        success: false,
        provider: 'resend',
        message: `Resend API returned status ${response.status}: ${errText.slice(0, 200)}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'resend',
        message: `Network error connecting to Resend API: ${msg}`,
      };
    }
  }

  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'resend',
        error: 'Resend API key is not configured. Email could not be dispatched.',
      };
    }

    const fromName = payload.fromName || this.defaultFromName;
    const fromEmail = payload.fromEmail || this.defaultFromEmail;
    const fromHeader = `${fromName} <${fromEmail}>`;

    const body: Record<string, unknown> = {
      from: fromHeader,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    };

    if (payload.text) {
      body.text = payload.text;
    }
    if (payload.replyTo) {
      body.reply_to = payload.replyTo;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as { id?: string; message?: string; name?: string; statusCode?: number };

      if (response.ok && data.id) {
        return {
          success: true,
          provider: 'resend',
          messageId: data.id,
          statusCode: response.status,
        };
      }

      const errorMessage = data.message || `Resend delivery failed with status ${response.status}`;
      return {
        success: false,
        provider: 'resend',
        error: errorMessage,
        statusCode: response.status,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'resend',
        error: `Resend request failed: ${msg}`,
      };
    }
  }
}
