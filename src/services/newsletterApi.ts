import { 
  Subscriber, 
  EmailSettings, 
  EmailTemplate, 
  EmailCampaign, 
  EmailLog, 
  SubscribeResponse 
} from '../types/newsletterTypes';

export async function subscribePublic(params: {
  email: string;
  name?: string;
  source?: string;
  hp_field?: string;
}): Promise<SubscribeResponse> {
  try {
    const res = await fetch('/api/subscribers/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Network error: ${msg}. Please check your connection.`,
    };
  }
}

export async function confirmSubscription(token: string): Promise<{ success: boolean; message: string; status?: string; subscriber?: any }> {
  try {
    const res = await fetch('/api/subscribers/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

export async function verifyEmailPublic(token: string): Promise<{ success: boolean; message: string; status?: string; subscriber?: any }> {
  return confirmSubscription(token);
}

export async function adminResendVerification(id: string): Promise<{ success: boolean; message: string; subscriber?: Subscriber; verificationUrl?: string }> {
  try {
    const res = await fetch(`/api/subscribers/${id}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

export async function adminBlockSubscriber(id: string): Promise<{ success: boolean; message: string; subscriber?: Subscriber }> {
  try {
    const res = await fetch(`/api/subscribers/${id}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

export async function adminReactivateSubscriber(id: string): Promise<{ success: boolean; message: string; subscriber?: Subscriber }> {
  try {
    const res = await fetch(`/api/subscribers/${id}/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

export async function adminUnsubscribeSubscriber(id: string): Promise<{ success: boolean; message: string; subscriber?: Subscriber }> {
  try {
    const res = await fetch(`/api/subscribers/${id}/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

export async function getUnsubscribeDetails(token: string): Promise<{ success: boolean; email?: string; status?: string; message?: string }> {
  try {
    const res = await fetch(`/api/subscribers/unsubscribe?token=${encodeURIComponent(token)}`);
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

export async function unsubscribeByToken(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/subscribers/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

// Admin API Methods
export async function fetchSubscribers(params?: { status?: string; search?: string }): Promise<Subscriber[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  const res = await fetch(`/api/subscribers?${searchParams.toString()}`);
  const data = await res.json();
  return data.subscribers || [];
}

export async function adminAddSubscriber(params: {
  email: string;
  name?: string;
  status?: string;
  sendWelcome?: boolean;
}): Promise<{ success: boolean; subscriber?: Subscriber; message?: string }> {
  const res = await fetch('/api/subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
}

export async function adminUpdateSubscriber(id: string, updates: Partial<Subscriber>): Promise<Subscriber | null> {
  const res = await fetch(`/api/subscribers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.subscriber || null;
}

export async function adminDeleteSubscriber(id: string): Promise<boolean> {
  const res = await fetch(`/api/subscribers/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  return Boolean(data.success);
}

export async function adminBulkSubscriberAction(action: 'delete' | 'unsubscribe', ids: string[]): Promise<number> {
  const res = await fetch('/api/subscribers/bulk-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ids }),
  });
  const data = await res.json();
  return data.count || 0;
}

export async function fetchEmailSettings(): Promise<EmailSettings> {
  const res = await fetch('/api/email/settings');
  const data = await res.json();
  return data.settings;
}

export async function updateEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
  const res = await fetch('/api/email/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  return data.settings;
}

export async function testEmailProviderConnection(provider?: 'resend' | 'brevo'): Promise<{ success: boolean; provider: string; message: string }> {
  const res = await fetch('/api/email/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  return await res.json();
}

export async function sendTestEmail(params: {
  to: string;
  subject?: string;
  content?: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const res = await fetch('/api/email/send-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
}

export async function fetchCampaigns(): Promise<EmailCampaign[]> {
  const res = await fetch('/api/email/campaigns');
  const data = await res.json();
  return data.campaigns || [];
}

export async function createAndQueueCampaign(campaignData: {
  name: string;
  subject: string;
  previewText?: string;
  fromName?: string;
  replyTo?: string;
  content: string;
  templateId?: string;
  audience: string;
  selectedSubscriberIds?: string[];
  testEmailAddress?: string;
}): Promise<{ success: boolean; campaign?: EmailCampaign; message?: string }> {
  const res = await fetch('/api/email/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData),
  });
  return await res.json();
}

export async function fetchTemplates(): Promise<EmailTemplate[]> {
  const res = await fetch('/api/email/templates');
  const data = await res.json();
  return data.templates || [];
}

export async function createTemplate(templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
  const res = await fetch('/api/email/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateData),
  });
  const data = await res.json();
  return data.template;
}

export async function updateTemplate(id: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const res = await fetch(`/api/email/templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateData),
  });
  const data = await res.json();
  return data.template;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const res = await fetch(`/api/email/templates/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  return Boolean(data.success);
}

export async function fetchEmailLogs(limit = 50): Promise<EmailLog[]> {
  const res = await fetch(`/api/email/logs?limit=${limit}`);
  const data = await res.json();
  return data.logs || [];
}
