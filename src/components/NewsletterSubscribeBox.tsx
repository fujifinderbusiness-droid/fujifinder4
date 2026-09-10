import React, { useState } from 'react';
import { Mail, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { subscribePublic } from '../services/newsletterApi';

interface NewsletterSubscribeBoxProps {
  source?: string;
  variant?: 'dark-hero' | 'minimal-card' | 'inline-article' | 'compact-footer';
  className?: string;
}

export const NewsletterSubscribeBox: React.FC<NewsletterSubscribeBoxProps> = ({
  source = 'website_cta',
  variant = 'dark-hero',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<'idle' | 'pending' | 'active'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setIsError(false);
    setStatusMessage(null);

    const res = await subscribePublic({
      email,
      source,
      hp_field: honeypot,
    });

    setLoading(false);

    if (res.success) {
      if (res.requiresConfirmation || res.status === 'pending') {
        setSubscriptionState('pending');
        setStatusMessage(res.message || 'Almost there! We\'ve sent a verification email. Please check your inbox and click the verification link to confirm your subscription.');
      } else {
        setSubscriptionState('active');
        setStatusMessage(res.message || 'Thank you! You are an active subscriber.');
      }
      setIsError(false);
    } else {
      setIsError(true);
      const msg = res.message || '';
      if (!msg || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please enter a valid')) {
        setStatusMessage("We couldn't find the email address.");
      } else {
        setStatusMessage(msg);
      }
    }
  };

  const isSubmitted = subscriptionState !== 'idle';

  // 1. INLINE ARTICLE VARIANT
  if (variant === 'inline-article') {
    return (
      <div className={`my-10 bg-[#FAF9F6] border border-[#EAE6DF] rounded-2xl p-6 sm:p-8 text-[#1A1A1A] ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center shrink-0 mt-1">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C62828]">The FujiFinder Dispatch</span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold mt-1 mb-2 text-[#111]">
              Enjoyed this field review?
            </h4>
            <p className="text-xs sm:text-sm text-[#666] mb-4 max-w-xl leading-relaxed">
              Get our next in-depth camera teardown, dynamic range sensor lab reports, and verified retailer price drops straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2 max-w-lg">
              {/* Honeypot anti-bot trap */}
              <input
                type="text"
                name="hp_field"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isError) setIsError(false);
                  }}
                  placeholder="Enter your email address"
                  required
                  disabled={loading || isSubmitted}
                  className="flex-1 bg-white border border-[#DDD] focus:border-black rounded-full px-4 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-all disabled:opacity-75"
                />
                <button
                  type="submit"
                  disabled={loading || isSubmitted}
                  className="bg-[#111] hover:bg-black text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-85"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : subscriptionState === 'pending' ? (
                    <>
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>Check Email</span>
                    </>
                  ) : subscriptionState === 'active' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                <span>Verified double opt-in. Unsubscribe anytime.</span>
              </div>

              {statusMessage && (
                <div className={`text-xs mt-2.5 p-3 rounded-xl flex items-start gap-2 ${
                  isError 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                    : subscriptionState === 'pending'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}>
                  {isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  ) : (
                    <Mail className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  )}
                  <span className="leading-relaxed">{statusMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMPACT FOOTER VARIANT
  if (variant === 'compact-footer') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Honeypot field */}
          <input
            type="text"
            name="hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex gap-2 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (isError) setIsError(false);
              }}
              placeholder="Enter your email address..."
              disabled={loading || isSubmitted}
              className="flex-1 px-4 py-2.5 bg-[#222] border border-[#333] rounded-full text-xs text-white placeholder-[#666] focus:outline-none focus:border-white transition-all disabled:opacity-60"
              required
            />
            <button
              type="submit"
              disabled={loading || isSubmitted}
              className="px-6 py-2.5 bg-white text-black font-semibold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#EEEBE6] transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-85"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              ) : subscriptionState === 'pending' ? (
                <>
                  <Mail className="w-3.5 h-3.5 text-black" /> Check Email
                </>
              ) : subscriptionState === 'active' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" /> Subscribed
                </>
              ) : (
                <>
                  Subscribe <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {statusMessage && (
            <p className={`text-[11px] pl-1 transition-all leading-relaxed ${isError ? 'text-rose-400' : subscriptionState === 'pending' ? 'text-amber-300' : 'text-emerald-400'}`}>
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    );
  }

  // 3. DARK HERO / BANNER VARIANT (Primary landing banner)
  return (
    <div className={`bg-[#0A0A0A] text-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 lg:p-14 relative overflow-hidden ${className}`}>
      {/* Subtle Abstract Wave / Contour Backdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
          <path d="M0,100 C150,200 350,0 500,100 C650,200 750,50 800,80 L800,400 L0,400 Z" fill="currentColor" />
          <path d="M0,160 C200,80 400,260 600,120 C700,50 780,180 800,150 L800,400 L0,400 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading & Description */}
        <div className="lg:col-span-7 space-y-3 text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C62828] bg-white/90 px-2 py-0.5 rounded-xs">
              The FujiFinder Dispatch
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug font-sans">
            The FujiFinder Dispatch: Ulasan Lab & Panduan Gear Kamera
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed font-normal">
            Wawasan teknis independen, uji lab sensor mendalam, dan rekomendasi gear kamera mingguan langsung ke inbox Anda.
          </p>
        </div>

        {/* Right Column: Input & Pill Button Form */}
        <div className="lg:col-span-5 text-left">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Honeypot field for anti-bot spam protection */}
            <input
              type="text"
              name="hp_field"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) setIsError(false);
                }}
                placeholder="Enter your email"
                required
                disabled={loading || isSubmitted}
                className="flex-1 bg-white/10 border border-white/15 focus:border-white/40 rounded-full px-5 py-3 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || isSubmitted}
                className="bg-white hover:bg-neutral-100 text-black font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-85"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying...</span>
                  </>
                ) : subscriptionState === 'pending' ? (
                  <>
                    <Mail className="w-4 h-4 text-black" />
                    <span>Check Email</span>
                  </>
                ) : subscriptionState === 'active' ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 pl-2">
              Verified double opt-in. Unsubscribe anytime.
            </p>

            {statusMessage && (
              <div className={`text-xs p-3.5 rounded-2xl animate-in fade-in flex items-start gap-2.5 ${
                isError 
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200' 
                  : subscriptionState === 'pending'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
              }`}>
                {isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                ) : (
                  <Mail className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
                )}
                <p className="leading-relaxed">{statusMessage}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
