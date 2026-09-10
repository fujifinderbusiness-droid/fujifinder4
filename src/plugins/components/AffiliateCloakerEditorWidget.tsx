import React, { useState } from 'react';
import { Link2, Sparkles, Check, Plus, AlertCircle } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

interface AffiliateCloakerEditorWidgetProps {
  content: string;
  onInsertCta?: (productName: string, suggestedUrl: string) => void;
}

export const AffiliateCloakerEditorWidget: React.FC<AffiliateCloakerEditorWidgetProps> = ({
  content,
  onInsertCta,
}) => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  if (!isPluginActive('fujifinder-affiliate-cloaker')) return null;

  const settings = getPluginSettings('fujifinder-affiliate-cloaker');
  if (!settings.unmonetizedAlertBadge) return null;

  const prefix = settings.cloakPrefix || '/go/';

  // Cameras to look for in text
  const cameraCatalogList = [
    { name: 'Fujifilm X100VI', slug: 'fujifilm-x100vi', defaultUrl: 'https://www.bhphotovideo.com/c/product/1811946-REG/fujifilm_16821959_x100vi_digital_camera_black.html' },
    { name: 'Fujifilm X-T50', slug: 'fujifilm-x-t50', defaultUrl: 'https://www.bhphotovideo.com/c/product/1828775-REG/fujifilm_x_t50_mirrorless_camera.html' },
    { name: 'Sony A7 IV', slug: 'sony-a7iv', defaultUrl: 'https://www.bhphotovideo.com/c/product/1668833-REG/sony_ilce_7m4_b_alpha_a7_iv_mirrorless.html' },
    { name: 'Ricoh GR IIIx', slug: 'ricoh-gr-iiix', defaultUrl: 'https://www.adorama.com/ircg3x.html' },
    { name: 'Canon EOS R6 II', slug: 'canon-r6-ii', defaultUrl: 'https://www.bhphotovideo.com/c/product/1733224-REG/canon_eos_r6_mark_ii.html' },
  ];

  const mentionsFound = cameraCatalogList.filter((cam) =>
    content.toLowerCase().includes(cam.name.toLowerCase())
  );

  if (mentionsFound.length === 0) return null;

  const handleCopyLink = (slug: string) => {
    const fullLink = `https://www.fujifinder.my.id${prefix}${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="bg-[#1C1C1C] border border-emerald-500/30 p-4 mt-4 text-white">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Affiliate Cloaker: Camera Mentions Detected ({mentionsFound.length})
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-800/40">
          Smart Cloak Routing
        </span>
      </div>

      <p className="text-xs text-[#aaa] mb-3">
        The plugin scanned this article and found mentions of the following gear. You can copy clean cloaked URLs or insert ready-to-convert CTA buttons:
      </p>

      <div className="space-y-2">
        {mentionsFound.map((cam) => (
          <div
            key={cam.slug}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#252525] border border-[#383838] text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{cam.name}</span>
              <span className="text-[11px] font-mono text-[#888]">
                {prefix}{cam.slug}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(cam.slug)}
                className="px-2.5 py-1 text-[11px] bg-[#333] hover:bg-[#444] text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedSlug === cam.slug ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>Copy Cloaked URL</>
                )}
              </button>
              {onInsertCta && (
                <button
                  type="button"
                  onClick={() => onInsertCta(cam.name, cam.defaultUrl)}
                  className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Affiliate CTA Block
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
