import React from 'react';
import { Send, Share2, Sparkles, Eye, Edit3, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentTab: 'editor' | 'filler' | 'templates';
  onTabChange: (tab: 'editor' | 'filler' | 'templates') => void;
  onOpenShare: () => void;
  onOpenTemplates: () => void;
  onTestWhatsApp: () => void;
  phoneSet: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenShare,
  onOpenTemplates,
  onTestWhatsApp,
  phoneSet,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Send className="w-5 h-5 -rotate-12 translate-x-px" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              WhatsForm<span className="text-emerald-600">Studio</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Workspace Mode */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('editor')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentTab === 'editor'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Constructor</span>
          </button>

          <button
            onClick={() => onTabChange('filler')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentTab === 'filler'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Llenar y Probar</span>
          </button>

          <button
            onClick={() => onOpenTemplates()}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Plantillas</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenShare}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Compartir enlace o código QR de este formulario"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          <button
            onClick={onTestWhatsApp}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>

      </div>
    </header>
  );
};
