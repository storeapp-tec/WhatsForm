import React from 'react';
import { Phone, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { FormConfig } from '../../types/form';
import { POPULAR_COUNTRIES } from '../../utils/whatsapp';

interface FormSettingsProps {
  config: FormConfig;
  onChange: (updated: FormConfig) => void;
}

export const FormSettings: React.FC<FormSettingsProps> = ({ config, onChange }) => {
  const currentCountry = POPULAR_COUNTRIES.find((c) => c.code === config.countryCode) || POPULAR_COUNTRIES[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Destino de WhatsApp y Encabezado</h2>
            <p className="text-xs text-slate-500">¿A qué número llegarán las respuestas completas?</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Envío seguro y directo</span>
        </div>
      </div>

      {/* Title and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Título principal del formulario
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            placeholder="Ej. Pedido a Domicilio, Cotización de Servicios..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Descripción o subtítulo (para quien llena el form)
          </label>
          <input
            type="text"
            value={config.description || ''}
            onChange={(e) => onChange({ ...config, description: e.target.value })}
            placeholder="Ej. Por favor llena los siguientes campos y pulsa enviar..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Target WhatsApp Phone */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
          <span>Número de WhatsApp receptor</span>
          <span className="text-rose-500">*</span>
          <span className="text-[11px] text-slate-400 font-normal ml-1">
            (Donde recibirás los pedidos y respuestas)
          </span>
        </label>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Country selector */}
          <div className="sm:w-60">
            <select
              value={config.countryCode}
              onChange={(e) => onChange({ ...config, countryCode: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {POPULAR_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} (+{c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Local Phone digits */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
              +{config.countryCode}
            </div>
            <input
              type="tel"
              value={config.targetPhone}
              onChange={(e) => onChange({ ...config, targetPhone: e.target.value.replace(/\D/g, '') })}
              placeholder={currentCountry.maskExample || '10 dígitos locales'}
              className="w-full pl-14 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Live validation & Instant WhatsApp Test Button */}
        <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          {config.targetPhone && config.targetPhone.length >= 7 ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Número configurado: +{config.countryCode} {config.targetPhone}</span>
              </span>
            </div>
          ) : (
            <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
              <span>⚠️ Ingresa tu número de celular para que los mensajes te lleguen a ti.</span>
            </span>
          )}

          <button
            type="button"
            disabled={!config.targetPhone || config.targetPhone.length < 7}
            onClick={() => {
              const fullNumber = `${config.countryCode.replace(/\D/g, '')}${config.targetPhone.replace(/\D/g, '')}`;
              const testMsg = encodeURIComponent(
                `👋 ¡Hola! Esta es una prueba de WhatsForm Studio para confirmar que tu número (+${config.countryCode} ${config.targetPhone}) está funcionando y listo para recibir los formularios.`
              );
              window.open(`https://wa.me/${fullNumber}?text=${testMsg}`, '_blank', 'noopener,noreferrer');
            }}
            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>📲 Probar apertura de chat con mi número</span>
          </button>
        </div>

        <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            <strong>100% Funcional:</strong> Al hacer clic en el botón de prueba, se abrirá WhatsApp con un mensaje preescrito hacia tu número sin necesidad de guardar contactos.
          </span>
        </p>
      </div>

      {/* Intro and Outro message customizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mensaje de saludo inicial en WhatsApp</span>
          </label>
          <input
            type="text"
            value={config.introMessage}
            onChange={(e) => onChange({ ...config, introMessage: e.target.value })}
            placeholder="Ej. ¡Hola! Te comparto mis respuestas:"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mensaje de despedida final en WhatsApp</span>
          </label>
          <input
            type="text"
            value={config.outroMessage}
            onChange={(e) => onChange({ ...config, outroMessage: e.target.value })}
            placeholder="Ej. Quedo al pendiente de tu respuesta. ¡Gracias!"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
