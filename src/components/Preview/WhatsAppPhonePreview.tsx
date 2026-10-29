import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical,
  Code2,
  Sparkles
} from 'lucide-react';
import { FormConfig, FormValues } from '../../types/form';
import { buildWhatsAppUrl, generateWhatsAppMessage } from '../../utils/whatsapp';

interface WhatsAppPhonePreviewProps {
  config: FormConfig;
  previewValues?: FormValues;
  onOpenTest?: () => void;
}

export const WhatsAppPhonePreview: React.FC<WhatsAppPhonePreviewProps> = ({
  config,
  previewValues = {},
  onOpenTest,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  const rawMessage = generateWhatsAppMessage(config, previewValues);
  const waUrl = buildWhatsAppUrl(config, previewValues);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Simple parser to render WhatsApp bold (*...*) and italics (_..._) visually
  const renderFormattedPreview = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('📋 *') && line.endsWith('*')) {
        const titleContent = line.replace(/^📋 \*/, '').replace(/\*$/, '');
        return (
          <div key={idx} className="font-bold text-slate-900 border-b border-emerald-100 pb-1 mb-1">
            📋 {titleContent}
          </div>
        );
      }
      if (line.startsWith('📌 *') && line.endsWith('*')) {
        const hContent = line.replace(/^📌 \*/, '').replace(/\*$/, '');
        return (
          <div key={idx} className="font-bold text-emerald-900 mt-2 mb-0.5">
            📌 {hContent}
          </div>
        );
      }
      if (line === '────────────────────') {
        return <div key={idx} className="my-1 border-t border-slate-200" />;
      }
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="border-l-2 border-emerald-500 pl-2 text-xs text-slate-600 my-0.5 italic">
            {line.substring(2)}
          </div>
        );
      }
      if (line.startsWith('  ✓ ')) {
        return (
          <div key={idx} className="pl-3 text-xs text-emerald-800 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{line.substring(4)}</span>
          </div>
        );
      }

      // Format inline bold *...* and italics _..._
      const formattedLine = line.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                .replace(/_([^_]+)_/g, '<em>$1</em>');

      return (
        <div 
          key={idx} 
          className="text-xs text-slate-800 leading-relaxed min-h-[1rem]"
          dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }} 
        />
      );
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-20">
      {/* Header of Preview */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vista Previa de WhatsApp</h3>
            <p className="text-[11px] text-slate-500">Cómo recibirá el mensaje tu destinatario</p>
          </div>
        </div>

        {/* View mode toggle */}
        <button
          type="button"
          onClick={() => setShowRawMarkdown(!showRawMarkdown)}
          className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
            showRawMarkdown
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Ver código con asteriscos y guiones de WhatsApp"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{showRawMarkdown ? 'Ver Formato' : 'Ver Código'}</span>
        </button>
      </div>

      {/* Simulated Phone Device Frame */}
      <div className="mx-auto max-w-[320px] bg-slate-900 rounded-[2.5rem] p-3 shadow-xl ring-1 ring-slate-800">
        {/* Notch */}
        <div className="w-24 h-4 bg-slate-900 mx-auto rounded-b-xl flex items-center justify-center mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
        </div>

        {/* Phone Screen Container */}
        <div className="bg-[#efeae2] rounded-[1.8rem] overflow-hidden flex flex-col h-[460px] border border-slate-300 shadow-inner relative">
          
          {/* WhatsApp Chat Bar */}
          <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/20">
                {config.targetPhone ? 'WA' : '?'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold truncate leading-tight">
                  {config.targetPhone ? `+${config.countryCode} ${config.targetPhone}` : 'Destinatario'}
                </div>
                <div className="text-[10px] text-emerald-200 leading-tight">en línea</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/80 shrink-0">
              <Video className="w-3.5 h-3.5" />
              <Phone className="w-3.5 h-3.5" />
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Chat Bubble Area with WhatsApp wallpaper look */}
          <div 
            className="flex-1 p-3 overflow-y-auto space-y-2 text-xs"
            style={{
              backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Timestamp pill */}
            <div className="flex justify-center my-1">
              <span className="bg-white/70 backdrop-blur-xs text-slate-500 text-[10px] px-2 py-0.5 rounded-md shadow-2xs font-medium">
                Hoy
              </span>
            </div>

            {/* Outgoing Message Bubble (Green) */}
            <div className="flex justify-end">
              <div className="max-w-[95%] bg-[#d9fdd3] text-slate-900 p-2.5 rounded-xl rounded-tr-none shadow-xs border border-[#c1e8ba] relative">
                
                {showRawMarkdown ? (
                  <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-800 break-words leading-tight">
                    {rawMessage}
                  </pre>
                ) : (
                  <div className="space-y-1">
                    {renderFormattedPreview(rawMessage)}
                  </div>
                )}

                {/* WhatsApp Checkmarks & Time */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                  <span>12:00</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Simulated chat input footer */}
          <div className="bg-slate-100 p-2 border-t border-slate-200 flex items-center gap-2 shrink-0">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-slate-400 border border-slate-200">
              Mensaje...
            </div>
            <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons Below Simulator */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">¡Texto copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar mensaje de WhatsApp</span>
            </>
          )}
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Probar apertura directa en WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
