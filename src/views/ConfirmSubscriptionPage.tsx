import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { confirmSubscription } from '../services/newsletterApi';
import { useData } from '../context/DataContext';

export const ConfirmSubscriptionPage: React.FC = () => {
  const { navigateTo } = useData();
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let token = '';
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('token')) {
      token = searchParams.get('token')!;
    } else if (window.location.hash.includes('token=')) {
      const hashQuery = window.location.hash.split('?')[1];
      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        token = hashParams.get('token') || '';
      }
    }

    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('No confirmation token provided. Please click the link received in your verification email.');
      return;
    }

    confirmSubscription(token).then((res) => {
      setLoading(false);
      setSuccess(res.success);
      setMessage(res.message);
    });
  }, []);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-[#EAE6DF] rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
          loading ? 'bg-neutral-100 text-neutral-600' : success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
        }`}>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <AlertCircle className="w-8 h-8" />
          )}
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111] tracking-tight mb-3">
          {loading ? 'Confirming...' : success ? 'Subscription Confirmed!' : 'Confirmation Error'}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-8">
          {loading
            ? 'Verifying your email address with the FujiFinder Dispatch server...'
            : message || (success ? 'Your email has been verified. Welcome to our community!' : 'The confirmation link may have expired or is invalid.')}
        </p>

        {!loading && (
          <button
            onClick={() => navigateTo('landing')}
            className="w-full bg-[#111] hover:bg-black text-white font-semibold text-xs sm:text-sm py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Latest Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
