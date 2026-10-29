import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Smartphone, Share2, CheckCheck } from 'lucide-react';
import { FormConfig } from '../../types/form';
import { encodeFormToHash } from '../../utils/whatsapp';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FormConfig;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, config }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);

  if (!isOpen) return null;

  // Build the public share link with hash encoding
  const hash = encodeFormToHash(config);
  const shareUrl = `${window.location.origin}${window.location.pathname}#fill=${hash}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `👋 ¡Hola! Por favor completa este breve formulario:\n\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Generate a QR code API URL (quick, high-res QR code image)
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    shareUrl
  )}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compartir Formulario</h3>
              <p className="text-xs text-slate-500">Envía el enlace a tus clientes o contactos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Direct URL input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Enlace directo al formulario
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 truncate select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleShareOnWhatsApp}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Enviar link por WhatsApp</span>
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir vista de cliente</span>
            </a>
          </div>

          {/* QR Code Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
              <QrCode className="w-4 h-4 text-slate-500" />
              <span>Código QR para escanear con el móvil</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs mb-3">
              <img
                src={qrApiUrl}
                alt="QR Code Formulario"
                className="w-40 h-40 object-contain mx-auto"
                loading="lazy"
              />
            </div>

            <p className="text-[11px] text-slate-500 max-w-xs">
              Ideal para colocar en mesas de restaurante, folletos, tarjetas de presentación o mostradores de atención.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
