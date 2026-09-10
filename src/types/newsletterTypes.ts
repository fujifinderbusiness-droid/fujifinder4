export type SubscriberStatus = 'active' | 'pending' | 'unsubscribed' | 'bounced' | 'blocked';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: SubscriberStatus;
  subscribed_at: string;
  email_verified_at: string | null;
  verification_token_hash: string | null;
  verification_expires_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
  welcome_email_sent_at?: string | null;
  double_opt_in_token?: string | null;
  unsubscribe_token: string;
  source: string; // e.g. 'landing_page', 'footer', 'article_cta', 'admin_manual'
  verification_attempts?: number;
  last_verification_sent_at?: string | null;
}

export type EmailProviderType = 'resend' | 'brevo';

export interface EmailSettings {
  activeProvider: EmailProviderType;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  enableWelcomeEmail: boolean;
  enableDoubleOptIn: boolean; // Acts as Email Verification toggle (default: true)
  verificationTokenExpirationHours: number; // default 24
  resendCooldownMinutes: number; // default 2
  maxVerificationAttempts: number; // default 5
  verificationSubject?: string;
  verificationTemplate?: string;
  unsubscribeFooterText: string;
  companyAddress: string;
  // Provider API Key configuration status (never exposes raw keys to client)
  resendConfigured?: boolean;
  brevoConfigured?: boolean;
  // Optional custom keys if set via admin UI
  customResendKey?: string;
  customBrevoKey?: string;
}

export type TemplateCategory = 'welcome' | 'newsletter' | 'article' | 'deal' | 'review' | 'custom';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: TemplateCategory;
  htmlContent: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export type CampaignAudience = 'all_active' | 'all_subscribers' | 'pending' | 'selected' | 'test';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  replyTo: string;
  content: string;
  templateId?: string;
  audience: CampaignAudience;
  selectedSubscriberIds?: string[];
  testEmailAddress?: string;
  provider: EmailProviderType;
  recipientCount: number;
  status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
  sent_at: string | null;
  metrics: {
    sent: number;
    delivered: number;
    failed: number;
    opened?: number;
    clicked?: number;
    bounced?: number;
  };
}

export type EmailLogType = 
  | 'transactional' 
  | 'marketing' 
  | 'welcome' 
  | 'confirmation' 
  | 'test'
  | 'verification_email_sent'
  | 'verification_email_failed'
  | 'email_verified'
  | 'verification_expired'
  | 'verification_resend_requested';

export interface EmailLog {
  id: string;
  campaignId?: string;
  recipient: string;
  subject: string;
  emailType: EmailLogType;
  provider: EmailProviderType;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  providerMessageId?: string;
  errorMessage?: string;
  sent_at: string;
  delivered_at?: string;
}

export interface SubscribeRequest {
  email: string;
  name?: string;
  source?: string;
  hp_field?: string; // Honeypot field for anti-spam protection
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  status?: SubscriberStatus;
  requiresConfirmation?: boolean;
  subscriber?: {
    id: string;
    email: string;
    status: SubscriberStatus;
  };
}
