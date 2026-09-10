import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Users, 
  Send, 
  FileCode, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  Eye, 
  Clock, 
  Smartphone, 
  Monitor, 
  Key, 
  ShieldCheck,
  Check,
  X,
  Sparkles,
  ArrowUpRight,
  Filter,
  Ban,
  ShieldAlert,
  SendHorizontal,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { 
  Subscriber, 
  EmailCampaign, 
  EmailTemplate, 
  EmailSettings, 
  EmailLog 
} from '../types/newsletterTypes';
import {
  fetchSubscribers,
  adminAddSubscriber,
  adminUpdateSubscriber,
  adminDeleteSubscriber,
  adminBulkSubscriberAction,
  adminResendVerification,
  adminBlockSubscriber,
  adminReactivateSubscriber,
  adminUnsubscribeSubscriber,
  fetchEmailSettings,
  updateEmailSettings,
  testEmailProviderConnection,
  sendTestEmail,
  fetchCampaigns,
  createAndQueueCampaign,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchEmailLogs
} from '../services/newsletterApi';

type AdminSubTab = 'subscribers' | 'campaigns' | 'templates' | 'logs' | 'settings';

export const NewsletterAdminManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('subscribers');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState<string>('');
  const [subscriberFilterStatus, setSubscriberFilterStatus] = useState<string>('all');
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<string[]>([]);
  const [isAddSubscriberModalOpen, setIsAddSubscriberModalOpen] = useState<boolean>(false);
  const [newSubEmail, setNewSubEmail] = useState<string>('');
  const [newSubName, setNewSubName] = useState<string>('');
  const [newSubSendWelcome, setNewSubSendWelcome] = useState<boolean>(true);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [campaignName, setCampaignName] = useState<string>('');
  const [campaignSubject, setCampaignSubject] = useState<string>('');
  const [campaignPreviewText, setCampaignPreviewText] = useState<string>('');
  const [campaignAudience, setCampaignAudience] = useState<string>('all_active');
  const [campaignContent, setCampaignContent] = useState<string>('');
  const [campaignTemplateId, setCampaignTemplateId] = useState<string>('');
  const [composerPreviewMode, setComposerPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [composerTestEmail, setComposerTestEmail] = useState<string>('');

  // Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateSubject, setTemplateSubject] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<string>('custom');
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');

  // Logs State
  const [logs, setLogs] = useState<EmailLog[]>([]);

  // Settings State
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [customResendKeyInput, setCustomResendKeyInput] = useState<string>('');
  const [customBrevoKeyInput, setCustomBrevoKeyInput] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [testSendRecipient, setTestSendRecipient] = useState<string>('');

  // Confirmation Modal State (replaces browser window.confirm blocked in sandboxed iframes)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState<boolean>(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Fetching
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [subsData, campsData, tplsData, settingsData, logsData] = await Promise.all([
        fetchSubscribers(),
        fetchCampaigns(),
        fetchTemplates(),
        fetchEmailSettings(),
        fetchEmailLogs(100),
      ]);
      setSubscribers(subsData);
      setCampaigns(campsData);
      setTemplates(tplsData);
      setSettings(settingsData);
      setLogs(logsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', `Failed to load newsletter data: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch = !subscriberSearch || 
        sub.email.toLowerCase().includes(subscriberSearch.toLowerCase()) || 
        (sub.name && sub.name.toLowerCase().includes(subscriberSearch.toLowerCase()));
      const matchesStatus = subscriberFilterStatus === 'all' || sub.status === subscriberFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, subscriberSearch, subscriberFilterStatus]);

  // Handle Add Subscriber
  const handleCreateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail) return;
    setActionLoading(true);
    const res = await adminAddSubscriber({
      email: newSubEmail,
      name: newSubName,
      status: 'active',
      sendWelcome: newSubSendWelcome,
    });
    setActionLoading(false);
    if (res.success && res.subscriber) {
      setSubscribers([res.subscriber, ...subscribers]);
      setIsAddSubscriberModalOpen(false);
      setNewSubEmail('');
      setNewSubName('');
      showToast('success', `Added ${res.subscriber.email} to subscriber list`);
    } else {
      showToast('error', res.message || 'Failed to add subscriber');
    }
  };

  // Bulk Actions
  const handleBulkAction = (action: 'delete' | 'unsubscribe') => {
    if (selectedSubscriberIds.length === 0) return;

    if (action === 'delete') {
      setConfirmDialog({
        title: `Delete ${selectedSubscriberIds.length} Subscriber${selectedSubscriberIds.length > 1 ? 's' : ''}?`,
        description: `Are you sure you want to permanently delete the ${selectedSubscriberIds.length} selected subscriber(s)? They will be removed from your newsletter database immediately.`,
        confirmLabel: `Delete ${selectedSubscriberIds.length} Subscriber${selectedSubscriberIds.length > 1 ? 's' : ''}`,
        variant: 'danger',
        onConfirm: async () => {
          const idsToDelete = [...selectedSubscriberIds];
          // Optimistic UI update: immediately remove from table
          setSubscribers((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
          setSelectedSubscriberIds([]);
          setConfirmDialog(null);
          setActionLoading(true);
          try {
            const count = await adminBulkSubscriberAction('delete', idsToDelete);
            showToast('success', `Deleted ${count} subscriber(s) successfully`);
            const updated = await fetchSubscribers();
            setSubscribers(updated);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast('error', `Failed to delete subscribers: ${msg}`);
            const updated = await fetchSubscribers();
            setSubscribers(updated);
          } finally {
            setActionLoading(false);
          }
        },
      });
      return;
    }

    if (action === 'unsubscribe') {
      setConfirmDialog({
        title: `Unsubscribe ${selectedSubscriberIds.length} Subscriber${selectedSubscriberIds.length > 1 ? 's' : ''}?`,
        description: `Mark ${selectedSubscriberIds.length} selected subscriber(s) as unsubscribed? They will stop receiving future marketing broadcasts.`,
        confirmLabel: 'Unsubscribe',
        variant: 'warning',
        onConfirm: async () => {
          const idsToUnsub = [...selectedSubscriberIds];
          const now = new Date().toISOString();
          setSubscribers((prev) =>
            prev.map((s) =>
              idsToUnsub.includes(s.id)
                ? { ...s, status: 'unsubscribed', unsubscribed_at: now }
                : s
            )
          );
          setSelectedSubscriberIds([]);
          setConfirmDialog(null);
          setActionLoading(true);
          try {
            const count = await adminBulkSubscriberAction('unsubscribe', idsToUnsub);
            showToast('success', `Marked ${count} subscriber(s) as unsubscribed`);
            const updated = await fetchSubscribers();
            setSubscribers(updated);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast('error', `Failed to unsubscribe: ${msg}`);
            const updated = await fetchSubscribers();
            setSubscribers(updated);
          } finally {
            setActionLoading(false);
          }
        },
      });
      return;
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Email', 'Name', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At'];
    const rows = filteredSubscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name || ''}"`,
      s.status,
      s.source || '',
      s.subscribed_at,
      s.unsubscribed_at || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fujifinder-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Template select in composer
  const handleSelectTemplateInComposer = (templateId: string) => {
    setCampaignTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setCampaignSubject(tpl.subject);
      setCampaignContent(tpl.htmlContent);
    }
  };

  // Queue and Send Campaign
  const handleSendCampaign = async (isTestOnly = false) => {
    if (!campaignSubject || !campaignContent) {
      showToast('error', 'Subject and email content are required');
      return;
    }

    if (isTestOnly && !composerTestEmail) {
      showToast('error', 'Please enter a test email address to receive the preview');
      return;
    }

    setActionLoading(true);
    const res = await createAndQueueCampaign({
      name: campaignName || campaignSubject,
      subject: campaignSubject,
      previewText: campaignPreviewText,
      content: campaignContent,
      templateId: campaignTemplateId || undefined,
      audience: isTestOnly ? 'test' : campaignAudience,
      selectedSubscriberIds: campaignAudience === 'selected' ? selectedSubscriberIds : undefined,
      testEmailAddress: isTestOnly ? composerTestEmail : undefined,
    });
    setActionLoading(false);

    if (res.success && res.campaign) {
      setCampaigns([res.campaign, ...campaigns]);
      if (!isTestOnly) {
        setIsComposerOpen(false);
        showToast('success', 'Campaign queued and dispatched in the background!');
      } else {
        showToast('success', `Test email sent to ${composerTestEmail}!`);
      }
      // Reload logs
      const updatedLogs = await fetchEmailLogs();
      setLogs(updatedLogs);
    } else {
      showToast('error', res.message || 'Failed to dispatch campaign');
    }
  };

  // Save Template
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !templateSubject || !templateHtml) return;

    setActionLoading(true);
    if (editingTemplate) {
      const updated = await updateTemplate(editingTemplate.id, {
        name: templateName,
        subject: templateSubject,
        description: templateDescription,
        category: templateCategory,
        htmlContent: templateHtml,
      });
      setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
      showToast('success', 'Template updated successfully');
    } else {
      const created = await createTemplate({
        name: templateName,
        subject: templateSubject,
        description: templateDescription,
        category: templateCategory,
        htmlContent: templateHtml,
        variables: ['subscriber.name', 'subscriber.email', 'unsubscribe_url', 'site.url'],
      });
      setTemplates([created, ...templates]);
      showToast('success', 'New template created');
    }
    setActionLoading(false);
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  // Test Provider Connection
  const handleTestConnection = async (provider?: 'resend' | 'brevo') => {
    setActionLoading(true);
    setConnectionStatus(null);
    const res = await testEmailProviderConnection(provider);
    setActionLoading(false);
    setConnectionStatus(res);
    if (res.success) {
      showToast('success', `Connection successful: ${res.message}`);
    } else {
      showToast('error', `Connection error: ${res.message}`);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setActionLoading(true);

    const payload: Partial<EmailSettings> = {
      ...settings,
    };
    if (customResendKeyInput.trim()) {
      payload.customResendKey = customResendKeyInput.trim();
    }
    if (customBrevoKeyInput.trim()) {
      payload.customBrevoKey = customBrevoKeyInput.trim();
    }

    const updated = await updateEmailSettings(payload);
    setSettings(updated);
    setCustomResendKeyInput('');
    setCustomBrevoKeyInput('');
    setActionLoading(false);
    showToast('success', 'Email settings updated successfully');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
          toastMessage.type === 'success' 
            ? 'bg-[#111] text-white border-neutral-700' 
            : 'bg-rose-900 text-white border-rose-700'
        }`}>
          {toastMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EEEBE6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#111] text-white rounded">
              Production Ready
            </span>
            <span className="text-[11px] text-[#666]">Real Delivery Integration (Resend & Brevo)</span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Newsletter & Dispatch Manager</h1>
          <p className="text-xs text-[#666] mt-1">
            Build subscriber loyalty, automate welcome sequences, curate camera reviews, and monitor inbox deliverability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsComposerOpen(true);
              if (templates.length > 0 && !campaignContent) {
                handleSelectTemplateInComposer(templates[0].id);
              }
            }}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-[11px] uppercase tracking-wider font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Compose Dispatch
          </button>
          <button
            onClick={() => setIsAddSubscriberModalOpen(true)}
            className="px-4 py-2 bg-white border border-[#DDD] hover:border-black text-black text-[11px] uppercase tracking-wider font-semibold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Subscriber
          </button>
          <button
            onClick={loadAllData}
            title="Refresh all metrics and subscribers"
            className="p-2 border border-[#DDD] bg-white hover:bg-neutral-50 rounded-md text-neutral-600 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 border border-[#EEEBE6] rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#888] uppercase tracking-wider font-medium">
            <span>Total Audience</span>
            <Users className="w-3.5 h-3.5 text-[#888]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#111] mt-1.5">{subscribers.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">All recorded readers</div>
        </div>

        <div className="bg-white p-4 border border-[#EEEBE6] rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#888] uppercase tracking-wider font-medium">
            <span>Active Subscribers</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-700 mt-1.5">
            {subscribers.filter((s) => s.status === 'active').length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Eligible for dispatch</div>
        </div>

        <div className="bg-white p-4 border border-[#EEEBE6] rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#888] uppercase tracking-wider font-medium">
            <span>Pending Opt-In</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="font-serif text-2xl font-bold text-amber-600 mt-1.5">
            {subscribers.filter((s) => s.status === 'pending').length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Awaiting confirmation</div>
        </div>

        <div className="bg-white p-4 border border-[#EEEBE6] rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#888] uppercase tracking-wider font-medium">
            <span>Campaigns Sent</span>
            <Send className="w-3.5 h-3.5 text-neutral-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#111] mt-1.5">{campaigns.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Broadcast editions</div>
        </div>

        <div className="bg-white p-4 border border-[#EEEBE6] rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#888] uppercase tracking-wider font-medium">
            <span>Active Provider</span>
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
          </div>
          <div className="font-sans text-lg font-bold text-black uppercase mt-2">
            {settings?.activeProvider || 'Resend'}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
            {settings?.activeProvider === 'resend' ? 'API Engine' : 'SMTP/API Engine'}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#EAE6DF]">
        {[
          { id: 'subscribers', label: 'Subscribers List', icon: Users, count: subscribers.length },
          { id: 'campaigns', label: 'Campaigns & Broadcasts', icon: Send, count: campaigns.length },
          { id: 'templates', label: 'Email Templates', icon: FileCode, count: templates.length },
          { id: 'logs', label: 'Delivery Logs', icon: Clock, count: logs.length },
          { id: 'settings', label: 'Provider & Automation Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminSubTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-black text-black bg-white/60'
                  : 'border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SUBSCRIBERS LIST */}
      {/* ============================================================ */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 border border-[#EEEBE6] rounded-xl">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subscriber by email or name..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <select
                value={subscriberFilterStatus}
                onChange={(e) => setSubscriberFilterStatus(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-black"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active ({subscribers.filter((s) => s.status === 'active').length})</option>
                <option value="pending">Pending ({subscribers.filter((s) => s.status === 'pending').length})</option>
                <option value="unsubscribed">Unsubscribed ({subscribers.filter((s) => s.status === 'unsubscribed').length})</option>
                <option value="blocked">Blocked ({subscribers.filter((s) => s.status === 'blocked').length})</option>
                <option value="bounced">Bounced ({subscribers.filter((s) => s.status === 'bounced').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {selectedSubscriberIds.length > 0 && (
                <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-300">
                  <span className="text-[11px] font-semibold text-neutral-700">
                    {selectedSubscriberIds.length} selected:
                  </span>
                  <button
                    onClick={() => handleBulkAction('unsubscribe')}
                    className="text-[11px] text-amber-700 hover:underline font-medium cursor-pointer"
                  >
                    Unsubscribe
                  </button>
                  <span className="text-neutral-300">•</span>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-semibold border border-neutral-300 hover:border-black rounded-lg flex items-center gap-1.5 bg-white cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white border border-[#EEEBE6] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] border-b border-[#EEEBE6] text-neutral-600 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredSubscribers.length > 0 && selectedSubscriberIds.length === filteredSubscribers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscriberIds(filteredSubscribers.map((s) => s.id));
                          } else {
                            setSelectedSubscriberIds([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Name / Source</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Subscribed Date</th>
                    <th className="p-3.5">Welcome Email</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEBE6]">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        No subscribers found matching the current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => {
                      const isSelected = selectedSubscriberIds.includes(sub.id);
                      return (
                        <tr key={sub.id} className={`hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-neutral-50' : ''}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubscriberIds([...selectedSubscriberIds, sub.id]);
                                } else {
                                  setSelectedSubscriberIds(selectedSubscriberIds.filter((id) => id !== sub.id));
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3.5 font-medium text-black">
                            <div className="flex items-center gap-1.5">
                              <span>{sub.email}</span>
                              {sub.email_verified_at && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" title={`Verified on ${new Date(sub.email_verified_at).toLocaleDateString()}`} />
                              )}
                            </div>
                            {sub.status === 'pending' && sub.verification_token && (
                              <div className="text-[10px] text-amber-700 font-mono flex items-center gap-1 mt-0.5">
                                <span>Token active</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const verifyUrl = `${window.location.origin}/verify-email?token=${sub.verification_token}`;
                                    navigator.clipboard.writeText(verifyUrl);
                                    showToast('success', `Copied verification link for ${sub.email}`);
                                  }}
                                  className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-1 py-0.2 rounded flex items-center gap-0.5 cursor-pointer"
                                  title="Copy direct verification link"
                                >
                                  <Copy className="w-2.5 h-2.5" /> copy link
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-600">
                            <div>{sub.name || <span className="text-neutral-400 italic">Reader</span>}</div>
                            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{sub.source || 'website'}</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                              sub.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sub.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : sub.status === 'blocked'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'active' ? 'bg-emerald-500' : sub.status === 'pending' ? 'bg-amber-500' : sub.status === 'blocked' ? 'bg-rose-500' : 'bg-neutral-400'
                              }`} />
                              {sub.status === 'active' ? 'Active' : sub.status === 'pending' ? 'Pending' : sub.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-neutral-600">
                            {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-3.5 text-neutral-600">
                            {sub.welcome_email_sent_at ? (
                              <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Dispatched
                              </span>
                            ) : sub.status === 'pending' ? (
                              <span className="text-amber-600 text-[11px]">Pending verification</span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">Not sent</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    setActionLoading(true);
                                    const res = await adminResendVerification(sub.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      showToast('success', res.message || `Sent new verification email to ${sub.email}`);
                                      const updated = await fetchSubscribers();
                                      setSubscribers(updated);
                                    } else {
                                      showToast('error', res.message || 'Failed to resend verification');
                                    }
                                  }}
                                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer inline-flex items-center gap-1"
                                  title="Resend verification email"
                                >
                                  <SendHorizontal className="w-3 h-3" /> Resend
                                </button>

                                <button
                                  onClick={async () => {
                                    setActionLoading(true);
                                    const res = await adminReactivateSubscriber(sub.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      showToast('success', `${sub.email} manually verified and activated`);
                                      const updated = await fetchSubscribers();
                                      setSubscribers(updated);
                                    } else {
                                      showToast('error', res.message || 'Failed to verify subscriber');
                                    }
                                  }}
                                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer inline-flex items-center gap-1"
                                  title="Manually verify and mark active"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Verify
                                </button>

                                <button
                                  onClick={async () => {
                                    setActionLoading(true);
                                    const res = await adminBlockSubscriber(sub.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      showToast('success', `${sub.email} blocked`);
                                      const updated = await fetchSubscribers();
                                      setSubscribers(updated);
                                    } else {
                                      showToast('error', res.message || 'Failed to block subscriber');
                                    }
                                  }}
                                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer inline-flex items-center gap-1"
                                  title="Block this subscriber"
                                >
                                  <Ban className="w-3 h-3" /> Block
                                </button>
                              </>
                            )}

                            {sub.status === 'active' && (
                              <>
                                <button
                                  onClick={async () => {
                                    setActionLoading(true);
                                    const res = await adminUnsubscribeSubscriber(sub.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      showToast('success', `${sub.email} marked as unsubscribed`);
                                      const updated = await fetchSubscribers();
                                      setSubscribers(updated);
                                    } else {
                                      showToast('error', res.message || 'Failed to unsubscribe');
                                    }
                                  }}
                                  className="text-[11px] text-neutral-500 hover:text-black cursor-pointer"
                                >
                                  Unsubscribe
                                </button>

                                <button
                                  onClick={async () => {
                                    setActionLoading(true);
                                    const res = await adminBlockSubscriber(sub.id);
                                    setActionLoading(false);
                                    if (res.success) {
                                      showToast('success', `${sub.email} blocked`);
                                      const updated = await fetchSubscribers();
                                      setSubscribers(updated);
                                    } else {
                                      showToast('error', res.message || 'Failed to block');
                                    }
                                  }}
                                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                                  title="Block this subscriber"
                                >
                                  Block
                                </button>
                              </>
                            )}

                            {sub.status === 'blocked' && (
                              <button
                                onClick={async () => {
                                  setActionLoading(true);
                                  const res = await adminReactivateSubscriber(sub.id);
                                  setActionLoading(false);
                                  if (res.success) {
                                    showToast('success', `${sub.email} unblocked and activated`);
                                    const updated = await fetchSubscribers();
                                    setSubscribers(updated);
                                  } else {
                                    showToast('error', res.message || 'Failed to unblock');
                                  }
                                }}
                                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                              >
                                Unblock
                              </button>
                            )}

                            {sub.status === 'unsubscribed' && (
                              <button
                                onClick={async () => {
                                  setActionLoading(true);
                                  const res = await adminReactivateSubscriber(sub.id);
                                  setActionLoading(false);
                                  if (res.success) {
                                    showToast('success', `${sub.email} reactivated`);
                                    const updated = await fetchSubscribers();
                                    setSubscribers(updated);
                                  } else {
                                    showToast('error', res.message || 'Failed to reactivate subscriber');
                                  }
                                }}
                                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  title: 'Delete Subscriber',
                                  description: `Are you sure you want to permanently delete "${sub.email}"? This action cannot be undone.`,
                                  confirmLabel: 'Delete Subscriber',
                                  variant: 'danger',
                                  onConfirm: async () => {
                                    setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
                                    setConfirmDialog(null);
                                    try {
                                      const ok = await adminDeleteSubscriber(sub.id);
                                      if (ok) {
                                        showToast('success', `Deleted ${sub.email}`);
                                      } else {
                                        showToast('error', 'Failed to delete subscriber');
                                        const updated = await fetchSubscribers();
                                        setSubscribers(updated);
                                      }
                                    } catch {
                                      showToast('error', 'Failed to delete subscriber');
                                      const updated = await fetchSubscribers();
                                      setSubscribers(updated);
                                    }
                                  },
                                });
                              }}
                              className="text-neutral-400 hover:text-rose-600 cursor-pointer p-1 inline-block align-middle transition-colors"
                              title={`Delete ${sub.email}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CAMPAIGNS & BROADCASTS */}
      {/* ============================================================ */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#111]">Editorial Broadcast History</h3>
            <button
              onClick={() => {
                setIsComposerOpen(true);
                if (templates.length > 0 && !campaignContent) {
                  handleSelectTemplateInComposer(templates[0].id);
                }
              }}
              className="px-4 py-2 bg-[#111] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Broadcast
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {campaigns.length === 0 ? (
              <div className="bg-white border border-[#EEEBE6] rounded-xl p-10 text-center text-neutral-400">
                <Send className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm">No email campaigns created yet.</p>
                <p className="text-xs text-neutral-400 mt-1">Compose your first dispatch to send reviews to your active readers.</p>
              </div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="bg-white border border-[#EEEBE6] rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-bold text-base text-black">{camp.name}</h4>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          camp.status === 'sent' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : camp.status === 'sending' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' 
                            : camp.status === 'failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 font-mono">
                        Subject: <span className="font-sans text-neutral-800">{camp.subject}</span>
                      </p>
                    </div>

                    <div className="text-right text-xs text-neutral-500">
                      <div>
                        Audience: <strong className="text-black capitalize">{camp.audience.replace('_', ' ')}</strong>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {camp.sent_at ? `Sent ${new Date(camp.sent_at).toLocaleString()}` : 'Queued'}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#F2EFE9] text-center text-xs">
                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Recipients</span>
                      <span className="font-bold text-black text-sm">{camp.recipientCount || camp.metrics?.sent || 0}</span>
                    </div>
                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Delivered</span>
                      <span className="font-bold text-emerald-700 text-sm">{camp.metrics?.delivered || camp.metrics?.sent || 0}</span>
                    </div>
                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Failed</span>
                      <span className="font-bold text-rose-600 text-sm">{camp.metrics?.failed || 0}</span>
                    </div>
                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Provider</span>
                      <span className="font-bold text-neutral-700 text-sm uppercase">{camp.provider || 'Resend'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: EMAIL TEMPLATES */}
      {/* ============================================================ */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#111]">Pre-built & Custom Templates</h3>
              <p className="text-xs text-neutral-500">Reusable responsive templates formatted with brand styling.</p>
            </div>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setTemplateName('');
                setTemplateSubject('');
                setTemplateCategory('custom');
                setTemplateDescription('');
                setTemplateHtml(`<h2>FujiFinder Special Dispatch</h2><p>Dear {{subscriber.name}},</p><p>Your content here.</p>`);
                setIsTemplateModalOpen(true);
              }}
              className="px-4 py-2 bg-[#111] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white border border-[#EEEBE6] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {tpl.variables?.length || 0} variables
                    </span>
                  </div>

                  <h4 className="font-sans font-bold text-base text-black">{tpl.name}</h4>
                  <p className="text-xs text-neutral-500 line-clamp-2">{tpl.description || 'Editorial template designed for reader engagement.'}</p>
                  <p className="text-[11px] text-neutral-700 font-mono bg-[#FAF9F6] p-2 rounded border border-[#EEEBE6] truncate">
                    Subject: {tpl.subject}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#EEEBE6] text-xs">
                  <button
                    onClick={() => {
                      setCampaignTemplateId(tpl.id);
                      setCampaignSubject(tpl.subject);
                      setCampaignContent(tpl.htmlContent);
                      setCampaignName(`Dispatch: ${tpl.name}`);
                      setIsComposerOpen(true);
                    }}
                    className="text-black hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Use in Campaign <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTemplateName(tpl.name);
                        setTemplateSubject(tpl.subject);
                        setTemplateCategory(tpl.category);
                        setTemplateDescription(tpl.description || '');
                        setTemplateHtml(tpl.htmlContent);
                        setIsTemplateModalOpen(true);
                      }}
                      className="text-neutral-500 hover:text-black cursor-pointer text-xs"
                    >
                      Edit
                    </button>
                    {!['tpl-welcome', 'tpl-review'].includes(tpl.id) && (
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Delete Template',
                            description: `Are you sure you want to delete template "${tpl.name}"? This cannot be undone.`,
                            confirmLabel: 'Delete Template',
                            variant: 'danger',
                            onConfirm: async () => {
                              setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
                              setConfirmDialog(null);
                              try {
                                await deleteTemplate(tpl.id);
                                showToast('success', 'Template deleted');
                              } catch {
                                showToast('error', 'Failed to delete template');
                                const updated = await fetchTemplates();
                                setTemplates(updated);
                              }
                            },
                          });
                        }}
                        className="text-neutral-400 hover:text-rose-600 cursor-pointer text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DELIVERY LOGS */}
      {/* ============================================================ */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#111]">Transmission Audit Trail</h3>
              <p className="text-xs text-neutral-500">Every transactional and newsletter email dispatched by the system.</p>
            </div>
            <button
              onClick={async () => {
                const refreshed = await fetchEmailLogs(100);
                setLogs(refreshed);
                showToast('success', 'Logs refreshed');
              }}
              className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-lg text-xs font-semibold bg-white cursor-pointer"
            >
              Refresh Logs
            </button>
          </div>

          <div className="bg-white border border-[#EEEBE6] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] border-b border-[#EEEBE6] text-neutral-600 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Recipient</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Message / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEBE6]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        No email activity logs recorded yet. Send a test email or broadcast to generate telemetry.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-3.5 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                          <span className="text-neutral-400">{new Date(log.sent_at).toLocaleDateString()}</span>
                        </td>
                        <td className="p-3.5 font-medium text-black">
                          {log.recipient}
                        </td>
                        <td className="p-3.5 text-neutral-700 max-w-xs truncate">
                          {log.subject}
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                            {log.emailType}
                          </span>
                        </td>
                        <td className="p-3.5 text-neutral-600 uppercase font-semibold text-[11px]">
                          {log.provider}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            log.status === 'sent' || log.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {log.status === 'sent' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-neutral-500 text-[11px] max-w-xs truncate">
                          {log.errorMessage ? (
                            <span className="text-rose-600">{log.errorMessage}</span>
                          ) : (
                            <span className="text-neutral-400 font-mono">{log.providerMessageId || 'OK'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: PROVIDER & AUTOMATION SETTINGS */}
      {/* ============================================================ */}
      {activeTab === 'settings' && settings && (
        <div className="space-y-6 max-w-4xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Active Provider Card */}
            <div className="bg-white border border-[#EEEBE6] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#111]">Primary Email Service Provider</h3>
                  <p className="text-xs text-neutral-500">Choose which email engine executes dispatches and transactional emails.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection(settings.activeProvider)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-xs font-semibold border border-neutral-300 hover:border-black rounded-lg bg-white flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Test Active Provider Connection
                  </button>
                </div>
              </div>

              {connectionStatus && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  connectionStatus.success 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {connectionStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <div>
                    <span className="font-bold uppercase tracking-wider">{connectionStatus.provider}: </span>
                    <span>{connectionStatus.message}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resend Option */}
                <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  settings.activeProvider === 'resend' ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-black">Resend (Modern API)</span>
                      <input
                        type="radio"
                        name="activeProvider"
                        value="resend"
                        checked={settings.activeProvider === 'resend'}
                        onChange={() => setSettings({ ...settings, activeProvider: 'resend' })}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">
                      High-deliverability developer email platform. Supports direct HTML formatting and dynamic tags.
                    </p>
                    <div className="text-[11px] text-neutral-600 pt-1 font-mono">
                      Status: {process.env.RESEND_API_KEY ? 'Key configured in environment' : settings.customResendKey ? 'Custom key active' : 'Default demo adapter active'}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <input
                      type="password"
                      placeholder="Update Resend API Key (re_...)"
                      value={customResendKeyInput}
                      onChange={(e) => setCustomResendKeyInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </label>

                {/* Brevo Option */}
                <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  settings.activeProvider === 'brevo' ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-black">Brevo (Sendinblue)</span>
                      <input
                        type="radio"
                        name="activeProvider"
                        value="brevo"
                        checked={settings.activeProvider === 'brevo'}
                        onChange={() => setSettings({ ...settings, activeProvider: 'brevo' })}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">
                      Enterprise European transactional and campaign provider with high SMTP throughput.
                    </p>
                    <div className="text-[11px] text-neutral-600 pt-1 font-mono">
                      Status: {process.env.BREVO_API_KEY ? 'Key configured in environment' : settings.customBrevoKey ? 'Custom key active' : 'Default demo adapter active'}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <input
                      type="password"
                      placeholder="Update Brevo API Key (xkeysib-...)"
                      value={customBrevoKeyInput}
                      onChange={(e) => setCustomBrevoKeyInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Sender Identity & Compliance */}
            <div className="bg-white border border-[#EEEBE6] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#111] pb-2 border-b border-[#EEEBE6]">
                Sender Identity & CAN-SPAM / GDPR Compliance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">From Name</label>
                  <input
                    type="text"
                    value={settings.fromName}
                    onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">From Email Address</label>
                  <input
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Reply-To Address</label>
                  <input
                    type="email"
                    value={settings.replyTo}
                    onChange={(e) => setSettings({ ...settings, replyTo: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Physical Postal / Entity Address (Compliance)</label>
                  <input
                    type="text"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1 text-xs">Unsubscribe Legal Disclaimer</label>
                <textarea
                  rows={2}
                  value={settings.unsubscribeFooterText}
                  onChange={(e) => setSettings({ ...settings, unsubscribeFooterText: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Automated Sequences */}
            <div className="bg-white border border-[#EEEBE6] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#111] pb-2 border-b border-[#EEEBE6]">
                Automated Sequences & Safeguards
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableWelcomeEmail}
                    onChange={(e) => setSettings({ ...settings, enableWelcomeEmail: e.target.checked })}
                    className="mt-1 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-black block">Automatic Welcome Dispatch</span>
                    <span className="text-xs text-neutral-500">
                      Dispatches the curated welcome guide immediately upon successful subscription.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableDoubleOptIn}
                    onChange={(e) => setSettings({ ...settings, enableDoubleOptIn: e.target.checked })}
                    className="mt-1 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-black block">Double Opt-In Email Verification</span>
                    <span className="text-xs text-neutral-500">
                      Sends a confirmation link to verify the recipient’s mailbox before activating them to receive broadcasts.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 bg-[#111] hover:bg-black text-white text-xs font-semibold rounded-full cursor-pointer transition-all shadow-sm disabled:opacity-60"
              >
                {actionLoading ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </form>

          {/* Quick Test Email Dispatcher */}
          <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-6 space-y-3">
            <h4 className="font-sans font-bold text-sm text-black">Live End-to-End Test Send</h4>
            <p className="text-xs text-neutral-600">
              Send a real test email through the active provider to verify SPF/DKIM/DMARC routing and inbox arrival.
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your personal email address..."
                value={testSendRecipient}
                onChange={(e) => setTestSendRecipient(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!testSendRecipient) {
                    showToast('error', 'Please enter a recipient email');
                    return;
                  }
                  setActionLoading(true);
                  const res = await sendTestEmail({ to: testSendRecipient });
                  setActionLoading(false);
                  if (res.success) {
                    showToast('success', `Test email sent to ${testSendRecipient}`);
                  } else {
                    showToast('error', res.error || 'Failed to dispatch test email');
                  }
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer transition-all shrink-0"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD MANUAL SUBSCRIBER */}
      {/* ============================================================ */}
      {isAddSubscriberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
              <h3 className="font-serif text-lg font-bold text-black">Add New Subscriber</h3>
              <button onClick={() => setIsAddSubscriberModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="subscriber@example.com"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Name (Optional)</label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newSubSendWelcome}
                  onChange={(e) => setNewSubSendWelcome(e.target.checked)}
                  className="rounded"
                />
                <span className="text-neutral-700">Send automated Welcome Dispatch immediately</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEEBE6]">
                <button
                  type="button"
                  onClick={() => setIsAddSubscriberModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-black font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-black text-white rounded-lg font-semibold cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? 'Adding...' : 'Add to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: COMPOSER / BROADCAST CREATOR */}
      {/* ============================================================ */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6] shrink-0">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-black">Compose Newsletter Dispatch</h3>
                <p className="text-xs text-neutral-500">Draft, preview, test, and send your camera analysis to your audience.</p>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="text-neutral-400 hover:text-black p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
              {/* Left Column: Configuration & Content */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Select Base Template</label>
                  <select
                    value={campaignTemplateId}
                    onChange={(e) => handleSelectTemplateInComposer(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black text-xs"
                  >
                    <option value="">-- Blank / Custom HTML --</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} ({tpl.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Campaign Reference Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Issue #44 - Fujifilm X-T5 Field Review"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Target Audience</label>
                    <select
                      value={campaignAudience}
                      onChange={(e) => setCampaignAudience(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black text-xs"
                    >
                      <option value="all_active">
                        Active Subscribers ({subscribers.filter((s) => s.status === 'active').length})
                      </option>
                      <option value="all_subscribers">
                        All Subscribers ({subscribers.length})
                      </option>
                      {selectedSubscriberIds.length > 0 && (
                        <option value="selected">
                          Selected Subscribers ({selectedSubscriberIds.length})
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Email Subject Line *</label>
                  <input
                    type="text"
                    placeholder="e.g. In the field with the Fujifilm X100VI: Lab Dynamic Range Breakdown"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-neutral-700">Email HTML Content *</label>
                    <div className="flex gap-1">
                      {['{{subscriber.name}}', '{{subscriber.email}}', '{{unsubscribe_url}}'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setCampaignContent(campaignContent + ' ' + tag)}
                          className="text-[10px] bg-neutral-100 hover:bg-neutral-200 px-1.5 py-0.5 rounded font-mono text-neutral-700 cursor-pointer"
                          title="Insert variable"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={12}
                    value={campaignContent}
                    onChange={(e) => setCampaignContent(e.target.value)}
                    className="w-full p-3 font-mono text-[11px] bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                    placeholder="Enter raw HTML or styled message markup..."
                    required
                  />
                </div>
              </div>

              {/* Right Column: Live Interactive Device Preview */}
              <div className="lg:col-span-5 bg-neutral-100 p-4 rounded-2xl border border-neutral-200 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                    Live Render Preview
                  </span>
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-neutral-300 text-xs">
                    <button
                      type="button"
                      onClick={() => setComposerPreviewMode('desktop')}
                      className={`p-1.5 rounded cursor-pointer ${composerPreviewMode === 'desktop' ? 'bg-black text-white' : 'text-neutral-500'}`}
                      title="Desktop Preview"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerPreviewMode('mobile')}
                      className={`p-1.5 rounded cursor-pointer ${composerPreviewMode === 'mobile' ? 'bg-black text-white' : 'text-neutral-500'}`}
                      title="Mobile Device Preview"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <div
                    className={`bg-white rounded-xl shadow-md border border-neutral-200 overflow-y-auto transition-all ${
                      composerPreviewMode === 'mobile' ? 'w-[320px] h-[480px]' : 'w-full h-[480px]'
                    }`}
                  >
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50 text-[11px]">
                      <div className="truncate">
                        <strong className="text-black">Subject:</strong> {campaignSubject || 'No Subject'}
                      </div>
                      <div className="text-neutral-400 text-[10px]">
                        From: FujiFinder Editorial &lt;newsletter@fujifinder.my.id&gt;
                      </div>
                    </div>

                    <div
                      className="p-4 text-xs prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: campaignContent
                          ? campaignContent
                              .replace(/{{subscriber\.name}}/g, 'Alex')
                              .replace(/{{subscriber\.email}}/g, 'alex@example.com')
                              .replace(/{{unsubscribe_url}}/g, '#')
                              .replace(/{{site\.url}}/g, 'https://www.fujifinder.my.id')
                          : '<div class="text-neutral-400 text-center py-10">Email preview appears here as you write.</div>',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EEEBE6] shrink-0 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Send test preview to email..."
                  value={composerTestEmail}
                  onChange={(e) => setComposerTestEmail(e.target.value)}
                  className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs w-64 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => handleSendCampaign(true)}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-black font-semibold rounded-lg cursor-pointer disabled:opacity-60"
                >
                  Send Preview
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-black font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      title: 'Confirm Campaign Dispatch',
                      description: `Queue broadcast to all recipients in the "${campaignAudience.replace('_', ' ')}" audience?`,
                      confirmLabel: 'Dispatch Campaign Now',
                      variant: 'primary',
                      onConfirm: async () => {
                        setConfirmDialog(null);
                        await handleSendCampaign(false);
                      },
                    });
                  }}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-semibold rounded-full cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Dispatch Campaign Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: TEMPLATE EDITOR */}
      {/* ============================================================ */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
              <h3 className="font-serif text-lg font-bold text-black">
                {editingTemplate ? 'Edit Template' : 'Create Email Template'}
              </h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Price Drop Alert"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Category</label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="welcome">Welcome Sequence</option>
                    <option value="review">Camera Review / Editorial</option>
                    <option value="alert">Price Alert</option>
                    <option value="custom">Custom Newsletter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Default Subject *</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="e.g. Price Drop: {{camera.name}} is now on sale"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">HTML Content *</label>
                <textarea
                  rows={10}
                  value={templateHtml}
                  onChange={(e) => setTemplateHtml(e.target.value)}
                  required
                  className="w-full p-3 font-mono text-[11px] bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEEBE6]">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-black font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-black text-white rounded-lg font-semibold cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* IN-APP CONFIRMATION MODAL (IFRAME-SAFE) */}
      {/* ============================================================ */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#EEEBE6]">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                }`}
              >
                {confirmDialog.variant === 'danger' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-black">{confirmDialog.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{confirmDialog.description}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => {
                  if (!isConfirmProcessing) setConfirmDialog(null);
                }}
                disabled={isConfirmProcessing}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsConfirmProcessing(true);
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setIsConfirmProcessing(false);
                  }
                }}
                disabled={isConfirmProcessing}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-black hover:bg-neutral-800 text-white'
                }`}
              >
                {isConfirmProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmDialog.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
