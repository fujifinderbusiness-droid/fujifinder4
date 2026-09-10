import { ResendAdapter } from './ResendAdapter';
import { BrevoAdapter } from './BrevoAdapter';
import { SendEmailPayload, SendEmailResult, ProviderConnectionResult, EmailProviderAdapter } from './types';
import { newsletterStore } from '../data/newsletterStore';
import { Subscriber, EmailLogType } from '../../src/types/newsletterTypes';

export class EmailService {
  private resendAdapter: ResendAdapter;
  private brevoAdapter: BrevoAdapter;

  constructor() {
    this.resendAdapter = new ResendAdapter(process.env.RESEND_API_KEY || '');
    this.brevoAdapter = new BrevoAdapter(process.env.BREVO_API_KEY || '');
  }

  private getActiveAdapter(): EmailProviderAdapter {
    const settings = newsletterStore.getSettings();
    const provider = settings.activeProvider || 'resend';

    // Update keys in adapters dynamically from env or settings
    const resendKey = process.env.RESEND_API_KEY || settings.customResendKey || '';
    const brevoKey = process.env.BREVO_API_KEY || settings.customBrevoKey || '';

    this.resendAdapter.setApiKey(resendKey);
    this.brevoAdapter.setApiKey(brevoKey);

    if (provider === 'brevo') {
      return this.brevoAdapter;
    }
    return this.resendAdapter;
  }

  private getAdapterByName(providerName: 'resend' | 'brevo'): EmailProviderAdapter {
    const settings = newsletterStore.getSettings();
    if (providerName === 'brevo') {
      const brevoKey = process.env.BREVO_API_KEY || settings.customBrevoKey || '';
      this.brevoAdapter.setApiKey(brevoKey);
      return this.brevoAdapter;
    }
    const resendKey = process.env.RESEND_API_KEY || settings.customResendKey || '';
    this.resendAdapter.setApiKey(resendKey);
    return this.resendAdapter;
  }

  async testConnection(providerName?: 'resend' | 'brevo'): Promise<ProviderConnectionResult> {
    const adapter = providerName ? this.getAdapterByName(providerName) : this.getActiveAdapter();
    return await adapter.testConnection();
  }

  /**
   * Replaces template variables like {{subscriber.email}}, {{unsubscribe_url}}, etc.
   */
  renderVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, val] of Object.entries(variables)) {
      const escapedKey = key.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
      const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g');
      result = result.replace(regex, val || '');
    }
    return result;
  }

  /**
   * Wraps email content in responsive email-safe wrapper if not already full HTML
   */
  wrapResponsiveEmail(content: string, options: { unsubscribeUrl?: string; companyAddress?: string } = {}): string {
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return content;
    }

    const settings = newsletterStore.getSettings();
    const address = options.companyAddress || settings.companyAddress || 'FujiFinder Media Group';
    const unsubUrl = options.unsubscribeUrl || '#';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FujiFinder</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #F8F7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EAE6DF; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
    ${content}
    <div style="background: #F4F1EC; padding: 24px 28px; text-align: center; font-size: 11px; color: #777777; border-top: 1px solid #E5E0D6;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #444444;">${address}</p>
      <p style="margin: 0 0 10px 0; line-height: 1.5;">${settings.unsubscribeFooterText}</p>
      <p style="margin: 0;">
        <a href="${unsubUrl}" style="color: #666666; text-decoration: underline; font-weight: 500;">Unsubscribe from this list</a> • 
        <a href="https://www.fujifinder.my.id" style="color: #666666; text-decoration: underline; font-weight: 500;">Visit FujiFinder</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Dispatches a single email with proper logging and error tracking
   */
  async sendSingleEmail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    type: EmailLogType;
    campaignId?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
  }): Promise<SendEmailResult> {
    const settings = newsletterStore.getSettings();
    const adapter = this.getActiveAdapter();

    const fromName = params.fromName || settings.fromName || 'FujiFinder Editorial';
    const fromEmail = params.fromEmail || settings.fromEmail || 'newsletter@fujifinder.my.id';
    const replyTo = params.replyTo || settings.replyTo || 'editorial@fujifinder.my.id';

    const payload: SendEmailPayload = {
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      fromName,
      fromEmail,
      replyTo,
    };

    const result = await adapter.sendEmail(payload);

    // Record activity log
    newsletterStore.addLog({
      campaignId: params.campaignId,
      recipient: params.to,
      subject: params.subject,
      emailType: params.type,
      provider: adapter.name,
      status: result.success ? 'sent' : 'failed',
      providerMessageId: result.messageId,
      errorMessage: result.error,
      sent_at: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Sends automatic welcome email to newly subscribed or confirmed reader
   */
  async sendWelcomeEmail(subscriber: Subscriber, baseUrl = 'https://www.fujifinder.my.id'): Promise<SendEmailResult> {
    const settings = newsletterStore.getSettings();
    if (!settings.enableWelcomeEmail) {
      return { success: true, provider: settings.activeProvider, messageId: 'welcome_disabled' };
    }

    // Prevent duplicate welcome emails
    if (subscriber.welcome_email_sent_at) {
      return { success: true, provider: settings.activeProvider, messageId: 'already_sent' };
    }

    const unsubUrl = `${baseUrl}/#unsubscribe?token=${subscriber.unsubscribe_token}`;
    const welcomeTemplate = newsletterStore.getTemplateById('tpl-welcome') || newsletterStore.getTemplates()[0];

    const variables: Record<string, string> = {
      'subscriber.name': subscriber.name || 'Friend',
      'subscriber.email': subscriber.email,
      'site.url': baseUrl,
      'unsubscribe_url': unsubUrl,
    };

    let html = welcomeTemplate ? welcomeTemplate.htmlContent : `
      <div style="padding: 32px 24px; text-align: center;">
        <h2>Welcome to the FujiFinder Dispatch!</h2>
        <p>You are now subscribed to receive our latest camera reviews, sensor comparisons, and gear guides.</p>
        <p><a href="${baseUrl}">Explore FujiFinder</a></p>
      </div>
    `;

    html = this.renderVariables(html, variables);

    const subject = welcomeTemplate ? this.renderVariables(welcomeTemplate.subject, variables) : 'Welcome to the FujiFinder Editorial Dispatch';

    const result = await this.sendSingleEmail({
      to: subscriber.email,
      subject,
      html,
      type: 'welcome',
    });

    if (result.success) {
      newsletterStore.updateSubscriber(subscriber.id, {
        welcome_email_sent_at: new Date().toISOString(),
      });
    }

    return result;
  }

  /**
   * Sends secure verification email for new or pending subscribers
   */
  async sendVerificationEmail(
    subscriber: Subscriber, 
    rawToken: string, 
    baseUrl = 'https://www.fujifinder.my.id'
  ): Promise<SendEmailResult> {
    const settings = newsletterStore.getSettings();
    const expirationHours = settings.verificationTokenExpirationHours || 24;

    // Both path and hash-based URLs are supported for maximum compatibility
    const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;
    const unsubUrl = `${baseUrl}/#unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token || '')}`;

    const subject = settings.verificationSubject || 'Confirm your FujiFinder subscription';

    const customMessage = settings.verificationTemplate 
      ? settings.verificationTemplate.replace(/\n/g, '<br/>')
      : 'Thanks for subscribing to FujiFinder.<br/><br/>Please confirm your email address to start receiving photography insights, camera recommendations, reviews, and updates.';

    const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 16px; overflow: hidden; color: #1A1A1A; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
  <div style="background: #0E0E0E; padding: 28px 24px; text-align: center;">
    <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">FujiFinder</h1>
    <p style="color: #A0A0A0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0 0;">Independent Camera Testing Lab & Field Guide</p>
  </div>
  <div style="padding: 36px 32px; text-align: left;">
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #111111;">Verify Your Email Address</h2>
    <div style="font-size: 14px; color: #444444; line-height: 1.6; margin: 0 0 24px 0;">
      ${customMessage}
    </div>
    <div style="background: #FAF9F6; border: 1px solid #EFECE6; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #555555;">
        Confirm ownership of <strong>${subscriber.email}</strong> to activate your subscription:
      </p>
      <a href="${verifyUrl}" style="display: inline-block; background: #111111; color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Verify My Email &rarr;</a>
      <p style="margin: 16px 0 0 0; font-size: 11px; color: #888888;">
        This verification link expires in <strong>${expirationHours} hours</strong> and can only be used once.
      </p>
    </div>
    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #EEEEEE; font-size: 12px; color: #777777; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
      <p style="margin: 0; word-break: break-all; color: #333333; font-family: monospace; font-size: 11px; background: #F5F5F5; padding: 8px 12px; border-radius: 6px;">
        ${verifyUrl}
      </p>
    </div>
    <p style="font-size: 12px; color: #999999; margin: 24px 0 0 0; line-height: 1.5;">
      If you did not make this request or don't recognize FujiFinder, you can safely ignore this email. Your email address will not be activated.
    </p>
  </div>
  <div style="background: #F8F8F8; padding: 20px 24px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE;">
    <p style="margin: 0 0 4px 0;">${settings.companyAddress || 'FujiFinder Media Group • Independent Photography Lab'}</p>
    <p style="margin: 0;">Sent to ${subscriber.email} for subscription verification.</p>
  </div>
</div>`;

    const textContent = `FujiFinder Email Verification\n\nThanks for subscribing to FujiFinder.\n\nPlease confirm your email address to start receiving photography insights, camera recommendations, reviews, and updates:\n\n${verifyUrl}\n\nThis verification link expires in ${expirationHours} hours.\n\nIf you did not request this, you can ignore this email.`;

    const result = await this.sendSingleEmail({
      to: subscriber.email,
      subject,
      html: htmlContent,
      text: textContent,
      type: 'verification_email_sent',
    });

    if (!result.success) {
      newsletterStore.recordLog({
        recipient: subscriber.email,
        subject,
        emailType: 'verification_email_failed',
        provider: result.provider,
        status: 'failed',
        errorMessage: result.error || 'Verification dispatch failed',
      });
    }

    return result;
  }

  /**
   * Sends double opt-in confirmation email (backwards compatibility)
   */
  async sendConfirmationEmail(subscriber: Subscriber, baseUrl = 'https://www.fujifinder.my.id'): Promise<SendEmailResult> {
    const rawToken = subscriber.double_opt_in_token || subscriber.verification_token_hash || '';
    return this.sendVerificationEmail(subscriber, rawToken, baseUrl);
  }

  /**
   * Reliable background campaign sender using batching and idempotency
   */
  async sendCampaign(campaignId: string, baseUrl = 'https://www.fujifinder.my.id'): Promise<{ total: number; sent: number; failed: number }> {
    const campaign = newsletterStore.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    if (campaign.status === 'sending' || campaign.status === 'sent') {
      throw new Error(`Campaign ${campaignId} is already ${campaign.status}`);
    }

    // Resolve audience securely on the server - ONLY active subscribers can receive campaigns
    const allSubscribers = newsletterStore.getSubscribers();
    let targets: Subscriber[] = [];

    if (campaign.audience === 'all_active' || campaign.audience === 'all_subscribers') {
      // Strictly filter for active subscribers only
      targets = allSubscribers.filter((s) => s.status === 'active');
    } else if (campaign.audience === 'selected' && campaign.selectedSubscriberIds) {
      const idSet = new Set(campaign.selectedSubscriberIds);
      // Strictly filter out any pending, unsubscribed, bounced, or blocked users even if selected
      targets = allSubscribers.filter((s) => idSet.has(s.id) && s.status === 'active');
    } else if (campaign.audience === 'test' && campaign.testEmailAddress) {
      targets = [{
        id: 'test-recipient',
        email: campaign.testEmailAddress,
        status: 'active',
        name: 'Test Recipient',
        subscribed_at: new Date().toISOString(),
        email_verified_at: new Date().toISOString(),
        verification_token_hash: null,
        verification_expires_at: null,
        unsubscribed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        welcome_email_sent_at: null,
        double_opt_in_token: null,
        unsubscribe_token: 'test_token',
        source: 'test_send'
      }];
    }

    // Mark campaign as sending
    newsletterStore.updateCampaign(campaignId, {
      status: 'sending',
      recipientCount: targets.length,
    });

    let sentCount = 0;
    let failedCount = 0;

    // Process in controlled batches of 5 to protect provider rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (sub) => {
        const unsubUrl = `${baseUrl}/#unsubscribe?token=${sub.unsubscribe_token}`;
        const variables: Record<string, string> = {
          'subscriber.name': sub.name || 'Friend',
          'subscriber.email': sub.email,
          'unsubscribe_url': unsubUrl,
          'site.url': baseUrl,
        };

        const personalizedSubject = this.renderVariables(campaign.subject, variables);
        let personalizedHtml = this.renderVariables(campaign.content, variables);
        personalizedHtml = this.wrapResponsiveEmail(personalizedHtml, { unsubscribeUrl: unsubUrl });

        const result = await this.sendSingleEmail({
          to: sub.email,
          subject: personalizedSubject,
          html: personalizedHtml,
          type: 'marketing',
          campaignId: campaign.id,
          fromName: campaign.fromName,
          replyTo: campaign.replyTo,
        });

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }));

      // Small pause between batches
      if (i + BATCH_SIZE < targets.length) {
        await new Promise((res) => setTimeout(res, 150));
      }
    }

    // Update campaign final status and metrics
    newsletterStore.updateCampaign(campaignId, {
      status: failedCount === targets.length && targets.length > 0 ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      metrics: {
        sent: sentCount,
        delivered: sentCount,
        failed: failedCount,
        opened: 0,
        clicked: 0,
      },
    });

    return { total: targets.length, sent: sentCount, failed: failedCount };
  }
}

export const emailService = new EmailService();
