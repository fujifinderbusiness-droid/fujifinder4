import React, { useState } from 'react';
import { Share2, Twitter, MessageCircle, Copy, Check, Bookmark, Send } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

interface SocialShareFloatingBarProps {
  articleTitle: string;
  articleUrl?: string;
}

export const SocialShareFloatingBar: React.FC<SocialShareFloatingBarProps> = ({
  articleTitle,
  articleUrl,
}) => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  const [copied, setCopied] = useState(false);

  if (!isPluginActive('fujifinder-social-share')) return null;

  const settings = getPluginSettings('fujifinder-social-share');
  if (settings.enableFloatingBar === false) return null;

  const url = articleUrl || window.location.href;
  const twitterHandle = settings.socialTwitterHandle || 'FujiFinder';

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${articleTitle}" via @${twitterHandle}\n\n`);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this camera guide on FujiFinder: ${articleTitle}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center bg-white border border-[#E0DCD5] shadow-lg py-3 px-2 gap-3"
      title="Share this guide"
    >
      <span className="text-[9px] uppercase font-mono text-[#888] tracking-widest -rotate-90 origin-center my-2 whitespace-nowrap">
        Share
      </span>

      {/* Twitter / X */}
      <button
        type="button"
        onClick={handleTwitterShare}
        className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors cursor-pointer"
        title="Share on X / Twitter"
      >
        <Twitter className="w-4 h-4 fill-current" />
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-[#25D366] hover:bg-[#F5F4F0] rounded-full transition-colors cursor-pointer"
        title="Share via WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </button>

      {/* Copy URL */}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopyLink}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
            copied ? 'bg-emerald-500 text-white' : 'text-[#555] hover:text-black hover:bg-[#F5F4F0]'
          }`}
          title="Copy Article URL"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {copied && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-[11px] px-2 py-1 whitespace-nowrap shadow-md pointer-events-none">
            Link copied!
          </div>
        )}
      </div>

      <div className="w-4 h-px bg-[#E0DCD5] my-0.5" />

      {/* Editorial badge */}
      <span className="text-[8px] font-mono text-[#999] tracking-tighter">
        FF
      </span>
    </div>
  );
};
