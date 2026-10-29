import React, { useState } from 'react';
import { 
  Send, 
  AlertCircle, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { FormConfig, FormValues } from '../../types/form';
import { buildWhatsAppUrl, validateFormResponses, generateWhatsAppMessage } from '../../utils/whatsapp';

interface PublicFormViewProps {
  config: FormConfig;
  onValuesChange?: (values: FormValues) => void;
  onBackToEditor?: () => void;
}

export const PublicFormView: React.FC<PublicFormViewProps> = ({
  config,
  onValuesChange,
  onBackToEditor,
}) => {
  const [values, setValues] = useState<FormValues>(() => {
    const initial: FormValues = {};
    for (const item of config.items) {
      if (item.kind === 'field' && (item.id === 'f-alumno-matricula' || item.label.toLowerCase().includes('matrícula') || item.label.toLowerCase().includes('matricula'))) {
        initial[item.id] = 'AL';
      }
    }
    return initial;
  });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const updateValue = (id: string, val: string | string[]) => {
    const updated = { ...values, [id]: val };
    setValues(updated);
    if (onValuesChange) {
      onValuesChange(updated);
    }
    // Clear missing error for this field if filled
    if (missingFields.includes(id)) {
      setMissingFields((prev) => prev.filter((fId) => fId !== id));
    }
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current = (values[fieldId] as string[]) || [];
    let updated: string[];
    if (current.includes(option)) {
      updated = current.filter((item) => item !== option);
    } else {
      updated = [...current, option];
    }
    updateValue(fieldId, updated);
  };

  const handleReset = () => {
    setValues({});
    setMissingFields([]);
    setSubmittedSuccess(false);
    if (onValuesChange) onValuesChange({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateFormResponses(config.items, values);
    if (!validation.isValid || !privacyAccepted) {
      const missing = [...validation.missingFieldIds];
      if (!privacyAccepted) {
        missing.push('privacy-consent');
      }
      setMissingFields(missing);
      
      // Scroll to the first missing element
      const firstMissingId = missing[0];
      const firstEl = document.getElementById(firstMissingId === 'privacy-consent' ? 'privacy-checkbox-container' : `field-${firstMissingId}`);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setMissingFields([]);
    setSubmittedSuccess(true);

    // Build the WhatsApp URL and launch it
    const waUrl = buildWhatsAppUrl(config, values);
    try {
      const msg = generateWhatsAppMessage(config, values);
      navigator.clipboard.writeText(msg);
    } catch (_) {}

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 px-3 sm:px-6">

      {/* Validation Error Banner */}
      {missingFields.length > 0 && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold">Faltan campos obligatorios</h4>
            <p className="mt-0.5">
              Por favor completa todos los campos marcados con asterisco (*) antes de enviar el formulario por WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Formulario para WhatsApp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {config.title || 'Formulario sin título'}
          </h1>
          {config.description && (
            <p className="mt-2 text-sm text-emerald-50 leading-relaxed max-w-2xl">
              {config.description}
            </p>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {config.items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No hay preguntas ni bloques en este formulario aún. Regresa al constructor para agregar contenido.
            </div>
          ) : (
            config.items.map((item, idx) => {
              if (item.kind === 'text') {
                return (
                  <div
                    key={item.id}
                    className={`py-2 ${
                      item.align === 'center'
                        ? 'text-center'
                        : item.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    <p
                      style={{ fontWeight: 800 }}
                      className="text-xl text-slate-900 border-b border-slate-100 pb-2 mb-2"
                    >
                      {item.content}
                    </p>
                  </div>
                );
              }

              // Field block
              const isMissing = missingFields.includes(item.id);
              const fieldVal = values[item.id] || '';

              return (
                <div
                  key={item.id}
                  id={`field-${item.id}`}
                  className={`space-y-2 transition-all p-3 rounded-xl ${
                    isMissing ? 'bg-rose-50/50 border border-rose-300' : ''
                  }`}
                >
                  <label className="block text-sm font-semibold text-slate-800 flex items-center justify-between">
                    <span className={`${item.isBoldLabel ? 'font-bold' : ''} ${item.isItalicLabel ? 'italic' : ''}`}>
                      {item.label || `Pregunta ${idx + 1}`}
                      {item.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                    </span>
                    {item.required && (
                      <span className="text-[11px] font-normal text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Obligatorio
                      </span>
                    )}
                  </label>

                  {item.helpText && (
                    <p className="text-xs text-slate-500">{item.helpText}</p>
                  )}

                  {/* Render based on fieldType */}
                  {item.fieldType === 'text' && (
                    <input
                      type="text"
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      placeholder={item.placeholder || 'Escribe tu respuesta...'}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  )}

                  {item.fieldType === 'textarea' && (
                    <textarea
                      rows={3}
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      placeholder={item.placeholder || 'Escribe los detalles aquí...'}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  )}

                  {item.fieldType === 'number' && (
                    <input
                      type="number"
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      placeholder={item.placeholder || '0'}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  )}

                  {item.fieldType === 'phone' && (
                    <input
                      type="tel"
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      placeholder={item.placeholder || 'Ej. 55 1234 5678'}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  )}

                  {item.fieldType === 'email' && (
                    <input
                      type="email"
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      placeholder={item.placeholder || 'nombre@ejemplo.com'}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  )}

                  {item.fieldType === 'date' && (
                    <input
                      type="date"
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  )}

                  {item.fieldType === 'select' && (
                    <select
                      value={fieldVal as string}
                      onChange={(e) => updateValue(item.id, e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        isMissing
                          ? 'border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    >
                      <option value="">-- Selecciona una opción --</option>
                      {(item.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {item.fieldType === 'radio' && (
                    <div className="space-y-2 pt-1">
                      {(item.options || []).map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            fieldVal === opt
                              ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`radio-${item.id}`}
                            value={opt}
                            checked={fieldVal === opt}
                            onChange={() => updateValue(item.id, opt)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {item.fieldType === 'checkbox' && (
                    <div className="space-y-2 pt-1">
                      {(item.options || []).map((opt, oIdx) => {
                        const checked = ((values[item.id] as string[]) || []).includes(opt);
                        return (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxToggle(item.id, opt)}
                              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {isMissing && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      ⚠️ Este campo es obligatorio.
                    </p>
                  )}
                </div>
              );
            })
          )}

          {/* Bottom Actions & Privacy Notice */}
          <div id="privacy-checkbox-container" className="pt-4 pb-2">
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              !privacyAccepted && missingFields.includes('privacy-consent')
                ? 'bg-rose-50/50 border-rose-300'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}>
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => {
                  setPrivacyAccepted(e.target.checked);
                  if (e.target.checked && missingFields.includes('privacy-consent')) {
                    setMissingFields(prev => prev.filter(id => id !== 'privacy-consent'));
                  }
                }}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 shrink-0"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                Acepto que mis datos sean utilizados exclusivamente para fines de atención y cobranza escolar. <span className="text-rose-500 font-bold">*</span>
              </span>
            </label>
            {!privacyAccepted && missingFields.includes('privacy-consent') && (
              <p className="text-xs text-rose-600 font-medium mt-1 ml-1">
                ⚠️ Debes aceptar el aviso de privacidad para continuar.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <span>Enviar mis datos por WhatsApp</span>
            </button>
          </div>
        </form>
      </div>

      {submittedSuccess && (
        <div className="mt-6 bg-emerald-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 bg-white text-emerald-700 rounded-full p-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">¡WhatsApp abierto con tus respuestas!</span>
              <p className="text-emerald-100 text-xs">Si la aplicación no abrió automáticamente, puedes pulsar el enlace directo.</p>
            </div>
          </div>
          <a
            href={buildWhatsAppUrl(config, values)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Abrir de nuevo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
