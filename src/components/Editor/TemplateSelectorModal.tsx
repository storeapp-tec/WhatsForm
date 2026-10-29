import React from 'react';
import { X, Sparkles, PlusCircle, ArrowRight, Utensils, Briefcase, CalendarCheck } from 'lucide-react';
import { PRESET_TEMPLATES, FormTemplate } from '../../data/templates';
import { FormConfig } from '../../types/form';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (config: FormConfig) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const handleCreateBlank = () => {
    const blankConfig: FormConfig = {
      id: `form-${Date.now()}`,
      title: 'Mi Formulario de WhatsApp',
      description: 'Por favor completa este formulario para enviarme tus datos.',
      countryCode: '52',
      targetPhone: '',
      introMessage: '👋 ¡Hola! Te envío mis respuestas del formulario:',
      outroMessage: '¡Muchas gracias por tu atención!',
      items: [
        {
          id: 'text-intro',
          kind: 'text',
          content: 'Información General',
          size: 'title',
          isBold: true,
          isItalic: false,
          align: 'left',
          includeInWhatsApp: true,
        },
        {
          id: 'field-name',
          kind: 'field',
          fieldType: 'text',
          label: '¿Cuál es tu nombre completo?',
          placeholder: 'Escribe tu nombre...',
          required: true,
          isBoldLabel: true,
        },
      ],
    };
    onSelectTemplate(blankConfig);
    onClose();
  };

  const getTemplateIcon = (id: string) => {
    if (id.includes('pedido')) return <Utensils className="w-5 h-5 text-amber-600" />;
    if (id.includes('cotiza')) return <Briefcase className="w-5 h-5 text-indigo-600" />;
    return <CalendarCheck className="w-5 h-5 text-teal-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Plantillas Listas para WhatsApp</h3>
              <p className="text-xs text-slate-500">Comienza con un diseño probado o crea uno desde cero</p>
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

        {/* Content list */}
        <div className="p-5 space-y-4">
          {/* Option: Blank */}
          <div 
            onClick={handleCreateBlank}
            className="group p-4 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                  Crear formulario en blanco
                </h4>
                <p className="text-xs text-slate-500">
                  Empieza desde cero agregando tus propios bloques de texto y preguntas.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
            O elige una plantilla prediseñada:
          </div>

          {/* Preset list */}
          <div className="grid grid-cols-1 gap-3">
            {PRESET_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(JSON.parse(JSON.stringify(tmpl.config)));
                  onClose();
                }}
                className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center shrink-0 transition-colors">
                    {getTemplateIcon(tmpl.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                        {tmpl.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">· {tmpl.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tmpl.description}
                    </p>
                    <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-2">
                      <span>{tmpl.config.items.length} campos y encabezados</span>
                      <span>·</span>
                      <span>Preconfigurado con WhatsApp</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 group-hover:text-white bg-slate-100 group-hover:bg-emerald-600 rounded-lg transition-colors shrink-0"
                >
                  Usar plantilla
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
