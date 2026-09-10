import { EmailProviderAdapter, SendEmailPayload, SendEmailResult, ProviderConnectionResult } from './types';

export class BrevoAdapter implements EmailProviderAdapter {
  readonly name = 'brevo' as const;
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
        provider: 'brevo',
        message: 'Brevo API key is not configured. Please set BREVO_API_KEY in your environment variables or in Admin Email Settings.',
      };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = (await response.json()) as { email?: string; plan?: Array<{ type?: string }> };
        return {
          success: true,
          provider: 'brevo',
          message: `Successfully connected to Brevo API. Account: ${data.email || 'Verified'}.`,
          details: { email: data.email },
        };
      }

      if (response.status === 401) {
        return {
          success: false,
          provider: 'brevo',
          message: 'Authentication failed (401 Unauthorized): Invalid Brevo API key. Please verify your BREVO_API_KEY.',
        };
      }

      const errText = await response.text();
      return {
        success: false,
        provider: 'brevo',
        message: `Brevo API returned status ${response.status}: ${errText.slice(0, 200)}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'brevo',
        message: `Network error connecting to Brevo API: ${msg}`,
      };
    }
  }

  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'brevo',
        error: 'Brevo API key is not configured. Email could not be dispatched.',
      };
    }

    const fromName = payload.fromName || this.defaultFromName;
    const fromEmail = payload.fromEmail || this.defaultFromEmail;

    const body: Record<string, unknown> = {
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
    };

    if (payload.text) {
      body.textContent = payload.text;
    }
    if (payload.replyTo) {
      body.replyTo = { email: payload.replyTo };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as { messageId?: string; message?: string; code?: string };

      if ((response.status === 200 || response.status === 201) && data.messageId) {
        return {
          success: true,
          provider: 'brevo',
          messageId: data.messageId,
          statusCode: response.status,
        };
      }

      const errorMessage = data.message || `Brevo delivery failed with status ${response.status}`;
      return {
        success: false,
        provider: 'brevo',
        error: errorMessage,
        statusCode: response.status,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: 'brevo',
        error: `Brevo request failed: ${msg}`,
      };
    }
  }
}
