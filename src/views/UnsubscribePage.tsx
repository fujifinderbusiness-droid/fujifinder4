import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { getUnsubscribeDetails, unsubscribeByToken, subscribePublic } from '../services/newsletterApi';
import { useData } from '../context/DataContext';

export const UnsubscribePage: React.FC = () => {
  const { navigateTo } = useData();
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [unsubscribed, setUnsubscribed] = useState<boolean>(false);
  const [resubscribed, setResubscribed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from query params or hash
    let extractedToken = '';
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('token')) {
      extractedToken = searchParams.get('token')!;
    } else if (window.location.hash.includes('token=')) {
      const hashQuery = window.location.hash.split('?')[1];
      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        extractedToken = hashParams.get('token') || '';
      }
    }

    setToken(extractedToken);

    if (!extractedToken) {
      setLoading(false);
      setErrorMessage('No unsubscribe token was provided. Please use the link included at the bottom of your email.');
      return;
    }

    // Lookup token
    getUnsubscribeDetails(extractedToken).then((res) => {
      setLoading(false);
      if (res.success && res.email) {
        setEmail(res.email);
        if (res.status === 'unsubscribed') {
          setUnsubscribed(true);
        }
      } else {
        setErrorMessage(res.message || 'This unsubscribe link is invalid or has expired.');
      }
    });
  }, []);

  const handleConfirmUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    setErrorMessage(null);

    const res = await unsubscribeByToken(token);
    setProcessing(false);

    if (res.success) {
      setUnsubscribed(true);
    } else {
      setErrorMessage(res.message || 'Unable to process unsubscription. Please try again.');
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;
    setProcessing(true);
    const res = await subscribePublic({ email, source: 'resubscribe_page' });
    setProcessing(false);
    if (res.success) {
      setResubscribed(true);
      setUnsubscribed(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-[#EAE6DF] rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        {/* Header Branding */}
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-5 text-neutral-800">
          <Mail className="w-6 h-6" />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111] tracking-tight mb-2">
          Email Preferences
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6">
          Manage your subscription to the FujiFinder Dispatch
        </p>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
            <span className="text-xs text-neutral-500">Verifying secure token...</span>
          </div>
        ) : errorMessage ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs sm:text-sm mb-6 flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-semibold mb-1">Unable to proceed</p>
              <p className="text-rose-700">{errorMessage}</p>
            </div>
          </div>
        ) : resubscribed ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Subscription Reactivated</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Welcome back! <strong>{email}</strong> has been returned to active status. You'll continue receiving new gear field evaluations and price drop dispatches.
              </p>
            </div>
            <button
              onClick={() => navigateTo('landing')}
              className="w-full bg-[#111] hover:bg-black text-white font-semibold text-xs sm:text-sm py-3 rounded-full transition-colors cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        ) : unsubscribed ? (
          <div className="space-y-5">
            <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                <span>You are unsubscribed</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                <strong>{email}</strong> has been successfully removed from our marketing and dispatch lists. You will no longer receive newsletter editions from FujiFinder.
              </p>
            </div>

            <p className="text-xs text-neutral-500">
              Unsubscribed by mistake?
            </p>

            <button
              onClick={handleResubscribe}
              disabled={processing}
              className="w-full bg-white border border-neutral-300 hover:border-black text-neutral-900 font-semibold text-xs sm:text-sm py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Processing...' : 'Re-subscribe with 1-click'}
            </button>

            <div className="pt-2">
              <button
                onClick={() => navigateTo('landing')}
                className="text-xs text-neutral-500 hover:text-black flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to FujiFinder
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl text-left text-xs text-neutral-700 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">Recipient Address</span>
              <span className="font-mono font-medium text-black text-sm break-all">{email}</span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed text-left">
              Confirming will remove you from all bi-weekly camera reviews, sensor test comparisons, and retailer price drop dispatches.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleConfirmUnsubscribe}
                disabled={processing}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Unsubscribing...</span>
                  </>
                ) : (
                  <span>Unsubscribe from all emails</span>
                )}
              </button>

              <button
                onClick={() => navigateTo('landing')}
                className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium text-xs sm:text-sm py-2.5 rounded-full transition-colors cursor-pointer"
              >
                Keep my subscription
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant compliance & secure tokenized link</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
