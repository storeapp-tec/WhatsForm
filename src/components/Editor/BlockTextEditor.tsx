import React from 'react';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy,
  Type,
  CheckSquare
} from 'lucide-react';
import { TextBlock, TextSize } from '../../types/form';

interface BlockTextEditorProps {
  block: TextBlock;
  index: number;
  total: number;
  onChange: (updated: TextBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export const BlockTextEditor: React.FC<BlockTextEditorProps> = ({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
      {/* Top Bar of the Block */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
            <Type className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bloque de Texto / Encabezado
          </span>
          <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>
        </div>

        {/* Quick actions: Reorder, duplicate, delete */}
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
            title="Duplicar bloque"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-rose-400 hover:text-rose-600 rounded transition-colors ml-1"
            title="Eliminar bloque"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting Controls Toolbar */}
      <div className="pt-3 flex flex-wrap items-center gap-2">
        {/* Size Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(
            [
              { id: 'title', label: 'Título' },
              { id: 'subtitle', label: 'Subtítulo' },
              { id: 'normal', label: 'Normal' },
              { id: 'small', label: 'Pequeño' },
            ] as { id: TextSize; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ ...block, size: s.id })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                block.size === s.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Style toggles: Bold & Italic */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onChange({ ...block, isBold: !block.isBold })}
            className={`p-1.5 rounded-md transition-colors ${
              block.isBold
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Negrita (*texto* en WhatsApp)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...block, isItalic: !block.isItalic })}
            className={`p-1.5 rounded-md transition-colors ${
              block.isItalic
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Cursiva (_texto_ en WhatsApp)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onChange({ ...block, align: 'left' })}
            className={`p-1.5 rounded-md transition-colors ${
              (block.align || 'left') === 'left'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Alinear a la izquierda"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...block, align: 'center' })}
            className={`p-1.5 rounded-md transition-colors ${
              block.align === 'center'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Centrar texto"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...block, align: 'right' })}
            className={`p-1.5 rounded-md transition-colors ${
              block.align === 'right'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Alinear a la derecha"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WhatsApp inclusion toggle */}
        <label className="ml-auto flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none py-1 px-2 hover:bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            checked={block.includeInWhatsApp}
            onChange={(e) => onChange({ ...block, includeInWhatsApp: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
          />
          <span>Enviar en mensaje de WhatsApp</span>
        </label>
      </div>

      {/* Text Area Content */}
      <div className="mt-3">
        <textarea
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Escribe el texto o encabezado aquí..."
          rows={block.size === 'title' ? 1 : 2}
          className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 placeholder:text-slate-400 ${
            block.size === 'title'
              ? 'text-lg font-bold'
              : block.size === 'subtitle'
              ? 'text-base font-semibold'
              : block.size === 'small'
              ? 'text-xs text-slate-500'
              : 'text-sm'
          } ${block.isBold ? 'font-bold' : ''} ${block.isItalic ? 'italic' : ''} ${
            block.align === 'center'
              ? 'text-center'
              : block.align === 'right'
              ? 'text-right'
              : 'text-left'
          }`}
        />
      </div>

      {/* Live Preview snippet */}
      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
        <span>Formato WhatsApp:</span>
        <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
          {block.isBold && block.isItalic
            ? `*_${block.content || 'texto'}_*`
            : block.isBold
            ? `*${block.content || 'texto'}*`
            : block.isItalic
            ? `_${block.content || 'texto'}_`
            : block.content || 'texto'}
        </code>
      </div>
    </div>
  );
};
