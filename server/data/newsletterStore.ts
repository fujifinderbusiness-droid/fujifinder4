import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  Subscriber, 
  EmailSettings, 
  EmailTemplate, 
  EmailCampaign, 
  EmailLog 
} from '../../src/types/newsletterTypes';

const DATA_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'newsletter-data.json');

export interface NewsletterStoreData {
  settings: EmailSettings;
  subscribers: Subscriber[];
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  logs: EmailLog[];
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-welcome',
    name: 'Welcome to FujiFinder Dispatch',
    subject: 'Welcome to the FujiFinder Editorial Dispatch',
    description: 'Sent automatically to new subscribers upon joining.',
    category: 'welcome',
    variables: ['{{subscriber.name}}', '{{subscriber.email}}', '{{site.url}}', '{{unsubscribe_url}}'],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
    htmlContent: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; border: 1px solid #EAE6DF; border-radius: 16px; overflow: hidden; color: #1A1A1A;">
  <div style="background: #0E0E0E; padding: 32px 24px; text-align: center;">
    <h1 style="color: #FFFFFF; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">FujiFinder</h1>
    <p style="color: #A0A0A0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0 0;">Camera Testing Lab & Gear Field Guide</p>
  </div>
  <div style="padding: 32px 28px;">
    <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Welcome to the circle of mindful photographers,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444444;">
      Thank you for subscribing to the <strong>FujiFinder Dispatch</strong>. Every two weeks, our editorial team brings you rigorous, 100% un-sponsored lab evaluations, real-world street photography impressions, and curated gear recommendations that help you tell better visual stories.
    </p>
    <div style="background: #FFFFFF; border: 1px solid #E5E1D8; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; font-size: 15px; color: #111111;">What you'll receive in your inbox:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555555; line-height: 1.8;">
        <li><strong>In-Depth Lab Scorecards:</strong> Real sensor dynamic range, chromatic aberration tests, and AF hit rates.</li>
        <li><strong>Field Comparisons:</strong> Direct head-to-head camera shootouts in low light and travel conditions.</li>
        <li><strong>Verified Price Drops:</strong> Monitored discounts across authorized camera retailers.</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="https://www.fujifinder.my.id" style="display: inline-block; background: #111111; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Explore Current Reviews &rarr;</a>
    </div>
  </div>
  <div style="background: #F0EAE1; padding: 20px 24px; text-align: center; font-size: 11px; color: #777777; border-top: 1px solid #E2DDD5;">
    <p style="margin: 0 0 8px 0;">FujiFinder Editorial Platform • Independent Photography Journal</p>
    <p style="margin: 0;">Sent to {{subscriber.email}} because you subscribed at FujiFinder.<br/>
      <a href="{{unsubscribe_url}}" style="color: #666666; text-decoration: underline;">Unsubscribe anytime</a> with one click.
    </p>
  </div>
</div>`
  },
  {
    id: 'tpl-new-article',
    name: 'New Field Review Announcement',
    subject: 'New Review: {{article.title}}',
    description: 'Broadcast announcement when a new camera test or editorial guide is published.',
    category: 'article',
    variables: ['{{subscriber.name}}', '{{article.title}}', '{{article.excerpt}}', '{{article.image}}', '{{article.url}}', '{{unsubscribe_url}}'],
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-09-02T10:00:00Z',
    htmlContent: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 16px; overflow: hidden; color: #1A1A1A;">
  <div style="background: #0E0E0E; padding: 24px; text-align: left; display: flex; align-items: center; justify-content: space-between;">
    <span style="color: #FFFFFF; font-size: 20px; font-weight: 700;">FujiFinder</span>
    <span style="background: rgba(255,255,255,0.15); color: #FFFFFF; font-size: 10px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">Fresh Review</span>
  </div>
  <div style="padding: 28px 24px;">
    <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #C62828; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Exclusive In-Depth Field Test</span>
    <h2 style="font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0 0 16px 0; color: #111111;">{{article.title}}</h2>
    <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; max-height: 320px; background: #F4F4F4;">
      <img src="{{article.image}}" alt="{{article.title}}" style="width: 100%; height: auto; display: block; object-fit: cover;" />
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; margin: 16px 0 24px 0;">
      {{article.excerpt}}
    </p>
    <div style="text-align: left; margin-bottom: 24px;">
      <a href="{{article.url}}" style="display: inline-block; background: #0E0E0E; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-size: 13px; font-weight: 600;">Read Full Field Analysis &rarr;</a>
    </div>
  </div>
  <div style="background: #FAFAFA; padding: 20px 24px; font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE; text-align: center;">
    <p style="margin: 0 0 6px 0;">FujiFinder • Independent Gear Lab & Photography Guides</p>
    <a href="{{unsubscribe_url}}" style="color: #999999; text-decoration: underline;">Unsubscribe from new review dispatches</a>
  </div>
</div>`
  },
  {
    id: 'tpl-camera-deal',
    name: 'Camera Deals & Price Drop Alert',
    subject: 'Price Alert: Verified Savings on {{product.name}}',
    description: 'Notify subscribers of verified retail price drops and holiday rebates.',
    category: 'deal',
    variables: ['{{subscriber.name}}', '{{product.name}}', '{{product.price}}', '{{product.image}}', '{{product.url}}', '{{unsubscribe_url}}'],
    created_at: '2026-09-03T10:00:00Z',
    updated_at: '2026-09-03T10:00:00Z',
    htmlContent: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 16px; overflow: hidden; color: #1A1A1A;">
  <div style="background: #101010; padding: 24px; text-align: center;">
    <span style="color: #4ADE80; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Verified Gear Deal Alert</span>
    <h1 style="color: #FFFFFF; font-size: 24px; margin: 8px 0 0 0; font-weight: 700;">FujiFinder Deals</h1>
  </div>
  <div style="padding: 28px 24px; text-align: center;">
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">{{product.name}}</h2>
    <div style="margin: 20px auto; max-width: 380px; border-radius: 12px; overflow: hidden; border: 1px solid #EEEEEE;">
      <img src="{{product.image}}" alt="{{product.name}}" style="width: 100%; height: auto; display: block;" />
    </div>
    <div style="display: inline-block; background: #FEF3C7; color: #92400E; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; margin: 12px 0 20px 0;">
      Instant Rebate Active Now
    </div>
    <p style="font-size: 14px; color: #555555; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.6;">
      Our automated pricing crawler detected a verified discount on this top-rated creator body at authorized partner retailers.
    </p>
    <a href="{{product.url}}" style="display: inline-block; background: #059669; color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 50px; font-size: 14px; font-weight: 700;">Check Retail Availability &rarr;</a>
  </div>
  <div style="background: #F9F9F9; padding: 20px 24px; font-size: 11px; color: #888888; border-top: 1px solid #EEEEEE; text-align: center;">
    <p style="margin: 0 0 6px 0;">Affiliate Disclosure: FujiFinder may earn an affiliate commission on qualifying purchases made through our links at no added cost to you.</p>
    <a href="{{unsubscribe_url}}" style="color: #999999; text-decoration: underline;">Unsubscribe from deal notifications</a>
  </div>
</div>`
  }
];

const DEFAULT_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'marcus.vance@creatorlab.io',
    name: 'Marcus Vance',
    status: 'active',
    subscribed_at: '2026-08-14T09:30:00Z',
    email_verified_at: '2026-08-14T09:31:00Z',
    verification_token_hash: null,
    verification_expires_at: null,
    unsubscribed_at: null,
    created_at: '2026-08-14T09:30:00Z',
    updated_at: '2026-08-14T09:30:00Z',
    welcome_email_sent_at: '2026-08-14T09:31:00Z',
    double_opt_in_token: null,
    unsubscribe_token: 'tok_mv_98234710293847',
    source: 'landing_page',
    verification_attempts: 1,
    last_verification_sent_at: '2026-08-14T09:30:00Z',
  },
  {
    id: 'sub-2',
    email: 'elena.rostova@streetframes.net',
    name: 'Elena Rostova',
    status: 'active',
    subscribed_at: '2026-08-22T14:15:00Z',
    email_verified_at: '2026-08-22T14:16:00Z',
    verification_token_hash: null,
    verification_expires_at: null,
    unsubscribed_at: null,
    created_at: '2026-08-22T14:15:00Z',
    updated_at: '2026-08-22T14:15:00Z',
    welcome_email_sent_at: '2026-08-22T14:16:00Z',
    double_opt_in_token: null,
    unsubscribe_token: 'tok_er_57291834719283',
    source: 'article_cta',
    verification_attempts: 1,
    last_verification_sent_at: '2026-08-22T14:15:00Z',
  },
  {
    id: 'sub-3',
    email: 'david.tanaka@tokyowalks.com',
    name: 'David Tanaka',
    status: 'active',
    subscribed_at: '2026-09-01T11:00:00Z',
    email_verified_at: '2026-09-01T11:01:00Z',
    verification_token_hash: null,
    verification_expires_at: null,
    unsubscribed_at: null,
    created_at: '2026-09-01T11:00:00Z',
    updated_at: '2026-09-01T11:00:00Z',
    welcome_email_sent_at: '2026-09-01T11:01:00Z',
    double_opt_in_token: null,
    unsubscribe_token: 'tok_dt_19283746591823',
    source: 'footer',
    verification_attempts: 1,
    last_verification_sent_at: '2026-09-01T11:00:00Z',
  },
  {
    id: 'sub-4',
    email: 'sarah.miller.photo@gmail.com',
    name: 'Sarah Miller',
    status: 'pending',
    subscribed_at: '2026-09-06T16:20:00Z',
    email_verified_at: null,
    verification_token_hash: 'd3b07384d113edec49eaa6238ad5ff00',
    verification_expires_at: '2026-09-12T16:20:00Z',
    unsubscribed_at: null,
    created_at: '2026-09-06T16:20:00Z',
    updated_at: '2026-09-06T16:20:00Z',
    welcome_email_sent_at: null,
    double_opt_in_token: 'optin_sm_482910293847',
    unsubscribe_token: 'tok_sm_48291029384722',
    source: 'landing_page',
    verification_attempts: 1,
    last_verification_sent_at: '2026-09-06T16:20:00Z',
  },
  {
    id: 'sub-5',
    email: 'alex.rivera.archive@yahoo.com',
    name: 'Alex Rivera',
    status: 'unsubscribed',
    subscribed_at: '2026-07-10T12:00:00Z',
    email_verified_at: '2026-07-10T12:01:00Z',
    verification_token_hash: null,
    verification_expires_at: null,
    unsubscribed_at: '2026-08-30T18:45:00Z',
    created_at: '2026-07-10T12:00:00Z',
    updated_at: '2026-08-30T18:45:00Z',
    welcome_email_sent_at: '2026-07-10T12:01:00Z',
    double_opt_in_token: null,
    unsubscribe_token: 'tok_ar_12093847561928',
    source: 'footer',
    verification_attempts: 1,
    last_verification_sent_at: '2026-07-10T12:00:00Z',
  }
];

const DEFAULT_SETTINGS: EmailSettings = {
  activeProvider: 'resend',
  fromName: 'FujiFinder Editorial',
  fromEmail: 'newsletter@fujifinder.my.id',
  replyTo: 'editorial@fujifinder.my.id',
  enableWelcomeEmail: true,
  enableDoubleOptIn: true, // Default: ON (email verification required)
  verificationTokenExpirationHours: 24,
  resendCooldownMinutes: 2,
  maxVerificationAttempts: 5,
  verificationSubject: 'Confirm your FujiFinder subscription',
  verificationTemplate: 'Thanks for subscribing to FujiFinder.\n\nPlease confirm your email address to start receiving photography insights, camera recommendations, reviews, and updates.',
  unsubscribeFooterText: 'You received this email because you subscribed to the FujiFinder Dispatch photography journal.',
  companyAddress: 'FujiFinder Media Group • Jakarta & Tokyo Independent Camera Testing Lab'
};

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'cmp-1',
    name: 'September Field Test Roundup: X-T5 vs X-T50',
    subject: 'Fujifilm X-T5 vs X-T50: Which 40MP Hybrid Should You Choose?',
    previewText: 'Head-to-head sensor benchmarks, dynamic range lab scorecards, and low-light street tests.',
    fromName: 'FujiFinder Editorial',
    replyTo: 'editorial@fujifinder.my.id',
    content: 'Full analysis comparing the twin 40.2MP flagship sensors with lab scorecards.',
    templateId: 'tpl-new-article',
    audience: 'all_active',
    provider: 'resend',
    recipientCount: 3,
    status: 'sent',
    created_at: '2026-09-04T10:00:00Z',
    sent_at: '2026-09-04T10:05:00Z',
    metrics: {
      sent: 3,
      delivered: 3,
      failed: 0,
      opened: 2,
      clicked: 1
    }
  }
];

const DEFAULT_LOGS: EmailLog[] = [
  {
    id: 'log-1',
    campaignId: 'cmp-1',
    recipient: 'marcus.vance@creatorlab.io',
    subject: 'Fujifilm X-T5 vs X-T50: Which 40MP Hybrid Should You Choose?',
    emailType: 'marketing',
    provider: 'resend',
    status: 'delivered',
    providerMessageId: 'res_msg_982341908234',
    sent_at: '2026-09-04T10:05:12Z',
    delivered_at: '2026-09-04T10:05:14Z'
  },
  {
    id: 'log-2',
    campaignId: 'cmp-1',
    recipient: 'elena.rostova@streetframes.net',
    subject: 'Fujifilm X-T5 vs X-T50: Which 40MP Hybrid Should You Choose?',
    emailType: 'marketing',
    provider: 'resend',
    status: 'delivered',
    providerMessageId: 'res_msg_982341908235',
    sent_at: '2026-09-04T10:05:15Z',
    delivered_at: '2026-09-04T10:05:18Z'
  },
  {
    id: 'log-3',
    campaignId: 'cmp-1',
    recipient: 'david.tanaka@tokyowalks.com',
    subject: 'Fujifilm X-T5 vs X-T50: Which 40MP Hybrid Should You Choose?',
    emailType: 'marketing',
    provider: 'resend',
    status: 'delivered',
    providerMessageId: 'res_msg_982341908236',
    sent_at: '2026-09-04T10:05:18Z',
    delivered_at: '2026-09-04T10:05:20Z'
  },
  {
    id: 'log-4',
    recipient: 'david.tanaka@tokyowalks.com',
    subject: 'Welcome to the FujiFinder Editorial Dispatch',
    emailType: 'welcome',
    provider: 'resend',
    status: 'sent',
    providerMessageId: 'res_msg_welc_1928374',
    sent_at: '2026-09-01T11:01:00Z'
  }
];

class NewsletterStore {
  private data: NewsletterStoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): NewsletterStoreData {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as NewsletterStoreData;
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        // Ensure email verification default is ON
        if (mergedSettings.enableDoubleOptIn === undefined) {
          mergedSettings.enableDoubleOptIn = true;
        }
        return {
          settings: mergedSettings,
          subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : DEFAULT_SUBSCRIBERS,
          templates: Array.isArray(parsed.templates) ? parsed.templates : DEFAULT_TEMPLATES,
          campaigns: parsed.campaigns || DEFAULT_CAMPAIGNS,
          logs: parsed.logs || DEFAULT_LOGS,
        };
      }
    } catch (e) {
      console.error('Error loading newsletter store file, using defaults:', e);
    }

    const initialData: NewsletterStoreData = {
      settings: DEFAULT_SETTINGS,
      subscribers: DEFAULT_SUBSCRIBERS,
      templates: DEFAULT_TEMPLATES,
      campaigns: DEFAULT_CAMPAIGNS,
      logs: DEFAULT_LOGS,
    };
    this.persistData(initialData);
    return initialData;
  }

  private persistData(dataToSave?: NewsletterStoreData) {
    try {
      const data = dataToSave || this.data;
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting newsletter store to disk:', e);
    }
  }

  // --- SUBSCRIBER METHODS ---

  getSubscribers(): Subscriber[] {
    return [...this.data.subscribers];
  }

  getSubscriberById(id: string): Subscriber | undefined {
    return this.data.subscribers.find((s) => s.id === id);
  }

  getSubscriberByEmail(email: string): Subscriber | undefined {
    const clean = email.trim().toLowerCase();
    return this.data.subscribers.find((s) => s.email.toLowerCase() === clean);
  }

  getSubscriberByToken(token: string): Subscriber | undefined {
    if (!token) return undefined;
    return this.data.subscribers.find((s) => s.unsubscribe_token === token);
  }

  getSubscriberByOptInToken(token: string): Subscriber | undefined {
    if (!token) return undefined;
    return this.data.subscribers.find((s) => s.double_opt_in_token === token);
  }

  getSubscriberByVerificationTokenHash(hash: string): Subscriber | undefined {
    if (!hash) return undefined;
    return this.data.subscribers.find((s) => s.verification_token_hash === hash);
  }

  getSubscriberByVerificationToken(rawToken: string): Subscriber | undefined {
    if (!rawToken) return undefined;
    const hash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    return this.data.subscribers.find((s) => 
      s.verification_token_hash === hash || s.double_opt_in_token === rawToken.trim()
    );
  }

  createSubscriber(params: {
    email: string;
    name?: string;
    status?: Subscriber['status'];
    source?: string;
    doubleOptInRequired?: boolean;
    verificationTokenHash?: string | null;
    verificationExpiresAt?: string | null;
  }): Subscriber {
    const cleanEmail = params.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const unsubscribeToken = 'unsub_' + crypto.randomBytes(16).toString('hex');
    const isPending = params.doubleOptInRequired !== false && (params.status === 'pending' || !params.status);

    const newSubscriber: Subscriber = {
      id: 'sub_' + crypto.randomBytes(8).toString('hex'),
      email: cleanEmail,
      name: params.name?.trim() || undefined,
      status: isPending ? 'pending' : (params.status || 'active'),
      subscribed_at: now,
      email_verified_at: isPending ? null : now,
      verification_token_hash: params.verificationTokenHash || null,
      verification_expires_at: params.verificationExpiresAt || null,
      unsubscribed_at: null,
      created_at: now,
      updated_at: now,
      welcome_email_sent_at: null,
      double_opt_in_token: null,
      unsubscribe_token: unsubscribeToken,
      source: params.source || 'landing_page',
      verification_attempts: isPending ? 1 : 0,
      last_verification_sent_at: isPending ? now : null,
    };

    this.data.subscribers.unshift(newSubscriber);
    this.persistData();
    return newSubscriber;
  }

  updateSubscriber(id: string, updates: Partial<Subscriber>): Subscriber | undefined {
    const index = this.data.subscribers.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    const current = this.data.subscribers[index];
    const updated: Subscriber = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.data.subscribers[index] = updated;
    this.persistData();
    return updated;
  }

  deleteSubscriber(idOrEmail: string): boolean {
    const target = idOrEmail.trim().toLowerCase();
    const initialLen = this.data.subscribers.length;
    this.data.subscribers = this.data.subscribers.filter(
      (s) => s.id !== idOrEmail && s.email.toLowerCase() !== target
    );
    if (this.data.subscribers.length !== initialLen) {
      this.persistData();
      return true;
    }
    return false;
  }

  bulkDeleteSubscribers(idsOrEmails: string[]): number {
    const set = new Set(idsOrEmails.map((i) => i.trim().toLowerCase()));
    const initialLen = this.data.subscribers.length;
    this.data.subscribers = this.data.subscribers.filter(
      (s) => !set.has(s.id.toLowerCase()) && !set.has(s.email.toLowerCase())
    );
    const deletedCount = initialLen - this.data.subscribers.length;
    if (deletedCount > 0) {
      this.persistData();
    }
    return deletedCount;
  }

  bulkUnsubscribe(ids: string[]): number {
    const set = new Set(ids);
    let count = 0;
    const now = new Date().toISOString();

    this.data.subscribers = this.data.subscribers.map((sub) => {
      if (set.has(sub.id) && sub.status !== 'unsubscribed') {
        count++;
        return {
          ...sub,
          status: 'unsubscribed',
          unsubscribed_at: now,
          updated_at: now,
        };
      }
      return sub;
    });

    if (count > 0) {
      this.persistData();
    }
    return count;
  }

  // --- SETTINGS METHODS ---

  getSettings(): EmailSettings {
    const resendEnvKey = process.env.RESEND_API_KEY || '';
    const brevoEnvKey = process.env.BREVO_API_KEY || '';

    return {
      ...this.data.settings,
      resendConfigured: Boolean(resendEnvKey && resendEnvKey.length > 5) || Boolean(this.data.settings.customResendKey),
      brevoConfigured: Boolean(brevoEnvKey && brevoEnvKey.length > 5) || Boolean(this.data.settings.customBrevoKey),
    };
  }

  updateSettings(updates: Partial<EmailSettings>): EmailSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.persistData();
    return this.getSettings();
  }

  // --- TEMPLATES METHODS ---

  getTemplates(): EmailTemplate[] {
    return [...this.data.templates];
  }

  getTemplateById(id: string): EmailTemplate | undefined {
    return this.data.templates.find((t) => t.id === id);
  }

  createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): EmailTemplate {
    const now = new Date().toISOString();
    const newTpl: EmailTemplate = {
      ...template,
      id: 'tpl_' + crypto.randomBytes(6).toString('hex'),
      created_at: now,
      updated_at: now,
    };
    this.data.templates.push(newTpl);
    this.persistData();
    return newTpl;
  }

  updateTemplate(id: string, updates: Partial<EmailTemplate>): EmailTemplate | undefined {
    const index = this.data.templates.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const updated: EmailTemplate = {
      ...this.data.templates[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.templates[index] = updated;
    this.persistData();
    return updated;
  }

  deleteTemplate(id: string): boolean {
    const initLen = this.data.templates.length;
    this.data.templates = this.data.templates.filter((t) => t.id !== id);
    if (this.data.templates.length !== initLen) {
      this.persistData();
      return true;
    }
    return false;
  }

  // --- CAMPAIGNS METHODS ---

  getCampaigns(): EmailCampaign[] {
    return [...this.data.campaigns];
  }

  getCampaignById(id: string): EmailCampaign | undefined {
    return this.data.campaigns.find((c) => c.id === id);
  }

  createCampaign(campaign: Omit<EmailCampaign, 'id' | 'created_at'>): EmailCampaign {
    const now = new Date().toISOString();
    const newCmp: EmailCampaign = {
      ...campaign,
      id: 'cmp_' + crypto.randomBytes(6).toString('hex'),
      created_at: now,
    };
    this.data.campaigns.unshift(newCmp);
    this.persistData();
    return newCmp;
  }

  updateCampaign(id: string, updates: Partial<EmailCampaign>): EmailCampaign | undefined {
    const index = this.data.campaigns.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    const updated: EmailCampaign = {
      ...this.data.campaigns[index],
      ...updates,
    };
    this.data.campaigns[index] = updated;
    this.persistData();
    return updated;
  }

  // --- LOGS METHODS ---

  getLogs(limit = 100): EmailLog[] {
    return this.data.logs.slice(0, limit);
  }

  addLog(log: Omit<EmailLog, 'id' | 'sent_at'> & { sent_at?: string }): EmailLog {
    const newLog: EmailLog = {
      sent_at: new Date().toISOString(),
      ...log,
      id: 'log_' + crypto.randomBytes(8).toString('hex'),
    };
    this.data.logs.unshift(newLog);
    // Keep max 500 logs in memory
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(0, 500);
    }
    this.persistData();
    return newLog;
  }

  recordLog(log: Omit<EmailLog, 'id' | 'sent_at'> & { sent_at?: string }): EmailLog {
    return this.addLog(log);
  }
}

export const newsletterStore = new NewsletterStore();
