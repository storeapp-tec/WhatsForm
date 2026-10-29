import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  Plus, 
  X, 
  CheckSquare, 
  CircleDot, 
  ListOrdered, 
  FileText, 
  Hash, 
  Calendar, 
  Phone, 
  Mail, 
  Bold, 
  Italic,
  Asterisk,
  Layers
} from 'lucide-react';
import { FieldBlock, FieldType } from '../../types/form';

interface BlockFieldEditorProps {
  block: FieldBlock;
  index: number;
  total: number;
  onChange: (updated: FieldBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Texto corto', icon: <FileText className="w-3.5 h-3.5" /> },
  { type: 'textarea', label: 'Cuadro de texto largo', icon: <Layers className="w-3.5 h-3.5" /> },
  { type: 'radio', label: 'Selección única (Radio)', icon: <CircleDot className="w-3.5 h-3.5" /> },
  { type: 'checkbox', label: 'Selección múltiple', icon: <CheckSquare className="w-3.5 h-3.5" /> },
  { type: 'select', label: 'Menú desplegable', icon: <ListOrdered className="w-3.5 h-3.5" /> },
  { type: 'number', label: 'Número', icon: <Hash className="w-3.5 h-3.5" /> },
  { type: 'phone', label: 'Teléfono', icon: <Phone className="w-3.5 h-3.5" /> },
  { type: 'email', label: 'Correo', icon: <Mail className="w-3.5 h-3.5" /> },
  { type: 'date', label: 'Fecha', icon: <Calendar className="w-3.5 h-3.5" /> },
];

export const BlockFieldEditor: React.FC<BlockFieldEditorProps> = ({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}) => {
  const hasOptions = block.fieldType === 'radio' || block.fieldType === 'checkbox' || block.fieldType === 'select';
  const options = block.options || ['Opción 1', 'Opción 2'];

  const handleAddOption = () => {
    const newOptions = [...options, `Opción ${options.length + 1}`];
    onChange({ ...block, options: newOptions });
  };

  const handleUpdateOption = (optIdx: number, val: string) => {
    const updated = [...options];
    updated[optIdx] = val;
    onChange({ ...block, options: updated });
  };

  const handleRemoveOption = (optIdx: number) => {
    if (options.length <= 1) return;
    const updated = options.filter((_, i) => i !== optIdx);
    onChange({ ...block, options: updated });
  };

  const handleTypeChange = (newType: FieldType) => {
    const willHaveOptions = newType === 'radio' || newType === 'checkbox' || newType === 'select';
    let currentOptions = block.options;
    if (willHaveOptions && (!currentOptions || currentOptions.length === 0)) {
      currentOptions = ['Opción 1', 'Opción 2'];
    }
    onChange({
      ...block,
      fieldType: newType,
      options: currentOptions,
    });
  };

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
      block.required ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Top Bar of the Question */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <FileText className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Pregunta / Campo
          </span>
          <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>

          {block.required && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              <Asterisk className="w-3 h-3" /> Requerido
            </span>
          )}
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
            title="Mover arriba"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
            title="Mover abajo"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title="Duplicar campo"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-rose-400 hover:text-rose-600 rounded transition-colors ml-1"
            title="Eliminar campo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Field Config */}
      <div className="pt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Label / Question Input */}
        <div className="md:col-span-8">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Etiqueta o Pregunta</span>
              {block.required && <span className="text-rose-500 font-bold">*</span>}
            </label>
            {/* Formatting toggles for the question */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange({ ...block, isBoldLabel: !block.isBoldLabel })}
                className={`p-1 rounded text-xs transition-colors ${
                  block.isBoldLabel
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Negrita en la etiqueta"
              >
                <Bold className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...block, isItalicLabel: !block.isItalicLabel })}
                className={`p-1 rounded text-xs transition-colors ${
                  block.isItalicLabel
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Cursiva en la etiqueta"
              >
                <Italic className="w-3 h-3" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Ej. ¿Cuál es tu nombre completo?, Elige tu platillo..."
            className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
              block.isBoldLabel ? 'font-bold' : ''
            } ${block.isItalicLabel ? 'italic' : ''}`}
          />
        </div>

        {/* Field Type Selector */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tipo de campo
          </label>
          <select
            value={block.fieldType}
            onChange={(e) => handleTypeChange(e.target.value as FieldType)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Options section (if radio, checkbox or select) */}
      {hasOptions && (
        <div className="mt-3 p-3 bg-slate-50/80 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Cuadros de opciones disponibles:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({options.length} opciones)
              </span>
            </span>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar opción</span>
            </button>
          </div>

          <div className="space-y-2">
            {options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="text-slate-400 text-xs w-5 text-right font-mono">
                  {optIdx + 1}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                  placeholder={`Opción ${optIdx + 1}`}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(optIdx)}
                  disabled={options.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded transition-colors"
                  title="Eliminar opción"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom controls: Required toggle + Placeholder */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Required switch toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={block.required}
              onChange={(e) => onChange({ ...block, required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </div>
          <span className="text-xs font-medium text-slate-700">
            Marcar como <strong className={block.required ? 'text-rose-600' : 'text-slate-700'}>requerido (obligatorio)</strong>
          </span>
        </label>

        {/* Optional placeholder / instructions */}
        {!hasOptions && (
          <div className="flex-1 max-w-xs ml-auto">
            <input
              type="text"
              value={block.placeholder || ''}
              onChange={(e) => onChange({ ...block, placeholder: e.target.value })}
              placeholder="Texto de ayuda o placeholder (opcional)"
              className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
