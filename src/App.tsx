import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Type, 
  FileText, 
  Layers, 
  CircleDot, 
  CheckSquare, 
  ListOrdered, 
  Calendar, 
  Hash, 
  Phone, 
  Mail, 
  Sparkles, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Smartphone,
  ChevronDown,
  Info
} from 'lucide-react';
import { FormConfig, FormItem, TextBlock, FieldBlock, FieldType, FormValues } from './types/form';
import { PRESET_TEMPLATES } from './data/templates';
import { Header } from './components/Header';
import { FormSettings } from './components/Editor/FormSettings';
import { BlockTextEditor } from './components/Editor/BlockTextEditor';
import { BlockFieldEditor } from './components/Editor/BlockFieldEditor';
import { WhatsAppPhonePreview } from './components/Preview/WhatsAppPhonePreview';
import { PublicFormView } from './components/Filler/PublicFormView';
import { TemplateSelectorModal } from './components/Editor/TemplateSelectorModal';
import { ShareModal } from './components/Editor/ShareModal';
import { buildWhatsAppUrl, decodeFormFromHash } from './utils/whatsapp';

const STORAGE_KEY = 'whatsform_clean_alumno_tutor_v6';

export const STUDENT_TUTOR_FORM_CONFIG: FormConfig = {
  id: 'form-alumno-tutor',
  title: 'Datos del Alumno y Tutor',
  description: 'Por favor ingresa la información requerida a continuación para enviarla por WhatsApp.',
  countryCode: '52',
  targetPhone: '8331554546',
  introMessage: '',
  outroMessage: 'Quedo al pendiente de la confirmación. ¡Muchas gracias!',
  items: [
    {
      id: 'txt-tutor',
      kind: 'text',
      content: 'Datos del tutor o responsable de pagos',
      size: 'title',
      isBold: true,
      isItalic: false,
      align: 'left',
      includeInWhatsApp: true,
    },
    {
      id: 'f-tutor-nombre',
      kind: 'field',
      fieldType: 'text',
      label: 'Nombre completo',
      placeholder: 'Nombre completo del tutor o responsable',
      required: true,
      isBoldLabel: true,
    },
    {
      id: 'f-tutor-tel',
      kind: 'field',
      fieldType: 'phone',
      label: 'Teléfono',
      placeholder: 'Ej. 833 123 4567',
      required: true,
      isBoldLabel: true,
    },
    {
      id: 'f-tutor-correo',
      kind: 'field',
      fieldType: 'email',
      label: 'Correo',
      placeholder: 'ejemplo@correo.com',
      required: true,
      isBoldLabel: true,
    },
    {
      id: 'txt-alumno',
      kind: 'text',
      content: 'Datos del alumno',
      size: 'title',
      isBold: true,
      isItalic: false,
      align: 'left',
      includeInWhatsApp: true,
    },
    {
      id: 'f-alumno-nombre',
      kind: 'field',
      fieldType: 'text',
      label: 'Nombre completo',
      placeholder: 'Nombre completo del alumno',
      required: true,
      isBoldLabel: true,
    },
    {
      id: 'f-alumno-matricula',
      kind: 'field',
      fieldType: 'text',
      label: 'Matrícula',
      placeholder: 'AL...',
      required: true,
      isBoldLabel: true,
    },
    {
      id: 'f-alumno-nivel',
      kind: 'field',
      fieldType: 'radio',
      label: 'Nivel',
      required: true,
      isBoldLabel: true,
      options: ['Prepa', 'Profesional'],
    },
    {
      id: 'f-alumno-semestre',
      kind: 'field',
      fieldType: 'select',
      label: 'Semestre',
      required: true,
      isBoldLabel: true,
      options: ['1', '2', '3', '4', '5', '6', '7', '8'],
    },
  ],
};

export default function App() {
  // Load initial config from URL hash, localStorage, or default template
  const [config, setConfig] = useState<FormConfig>(() => {
    let cfg = STUDENT_TUTOR_FORM_CONFIG;

    // Check hash for #fill=...
    if (typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#fill=(.+)/);
      if (match && match[1]) {
        const decoded = decodeFormFromHash(match[1]);
        if (decoded) {
          cfg = decoded;
        }
      }
    } else if (typeof window !== 'undefined') {
      // Check localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.items) && parsed.id === 'form-alumno-tutor') {
            cfg = parsed;
          }
        }
      } catch (e) {
        console.error('Failed reading localStorage', e);
      }
    }

    // ALWAYS FORCE THE CORRECT PHONE NUMBER AND CLEAN FORMAT
    const overridePhone = typeof window !== 'undefined' && (window as any).WHATSAPP_PHONE
      ? String((window as any).WHATSAPP_PHONE).replace(/\D/g, '')
      : '';
    cfg.targetPhone = overridePhone || '8331554546';
    cfg.introMessage = '';
    cfg.items = cfg.items.map((it: FormItem) => {
      if (it.kind === 'text') {
        return { ...it, isBold: true, size: 'title' };
      }
      if (it.kind === 'field' && (it.id === 'f-alumno-semestre' || it.label.toLowerCase().includes('semestre'))) {
        return { ...it, options: ['1', '2', '3', '4', '5', '6', '7', '8'] };
      }
      return it;
    });

    return cfg;
  });

  // Editor mode is ONLY enabled if opening admin.html or URL has #admin / #edit
  const [isEditorMode, setIsEditorMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.includes('admin') ||
      window.location.hash === '#admin' ||
      window.location.hash === '#edit' ||
      window.location.search.includes('admin=')
    );
  });

  const [currentTab, setCurrentTab] = useState<'editor' | 'filler' | 'templates'>('filler');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState<FormValues>({});
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Sync config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  }, [config]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#edit') {
        setIsEditorMode(true);
        setCurrentTab('editor');
        return;
      }

      const match = window.location.hash.match(/#fill=(.+)/);
      if (match && match[1]) {
        const decoded = decodeFormFromHash(match[1]);
        if (decoded) {
          setConfig(decoded);
        }
      }
      setIsEditorMode(false);
      setCurrentTab('filler');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openEditor = () => {
    setIsEditorMode(true);
    setCurrentTab('editor');
    window.location.hash = 'edit';
  };

  const closeEditor = () => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('admin')) {
      window.location.href = './index.html';
      return;
    }
    setIsEditorMode(false);
    setCurrentTab('filler');
    history.pushState('', document.title, window.location.pathname + window.location.search);
  };

  // Block item operations
  const handleUpdateItem = (index: number, updatedItem: FormItem) => {
    const newItems = [...config.items];
    newItems[index] = updatedItem;
    setConfig({ ...config, items: newItems });
  };

  const handleDeleteItem = (index: number) => {
    const newItems = config.items.filter((_, i) => i !== index);
    setConfig({ ...config, items: newItems });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.items.length) return;
    const newItems = [...config.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setConfig({ ...config, items: newItems });
  };

  const handleDuplicateItem = (index: number) => {
    const itemToClone = config.items[index];
    const cloned: FormItem = {
      ...JSON.parse(JSON.stringify(itemToClone)),
      id: `${itemToClone.kind}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const newItems = [...config.items];
    newItems.splice(index + 1, 0, cloned);
    setConfig({ ...config, items: newItems });
  };

  // Add new Text block
  const handleAddTextBlock = (size: 'title' | 'subtitle' | 'normal' = 'subtitle') => {
    const newBlock: TextBlock = {
      id: `text-${Date.now()}`,
      kind: 'text',
      content: size === 'title' ? 'Nuevo Título de Sección' : 'Información o instrucciones...',
      size: size,
      isBold: size === 'title',
      isItalic: false,
      align: 'left',
      includeInWhatsApp: true,
    };
    setConfig({ ...config, items: [...config.items, newBlock] });
    setShowAddMenu(false);
  };

  // Add new Field block
  const handleAddFieldBlock = (fieldType: FieldType) => {
    const hasOptions = fieldType === 'radio' || fieldType === 'checkbox' || fieldType === 'select';
    const newBlock: FieldBlock = {
      id: `field-${Date.now()}`,
      kind: 'field',
      fieldType: fieldType,
      label: 
        fieldType === 'radio' ? '¿Cuál opción prefieres?' :
        fieldType === 'checkbox' ? 'Selecciona tus complementos:' :
        fieldType === 'select' ? 'Elige una opción del menú:' :
        fieldType === 'textarea' ? 'Comentarios o detalles adicionales:' :
        fieldType === 'date' ? 'Fecha preferida:' :
        fieldType === 'phone' ? 'Teléfono de contacto:' :
        fieldType === 'email' ? 'Correo electrónico:' :
        fieldType === 'number' ? 'Cantidad solicitada:' :
        'Escribe tu pregunta aquí...',
      required: true,
      options: hasOptions ? ['Opción A', 'Opción B', 'Opción C'] : undefined,
      placeholder: fieldType === 'textarea' ? 'Escribe aquí los detalles...' : 'Tu respuesta...',
    };
    setConfig({ ...config, items: [...config.items, newBlock] });
    setShowAddMenu(false);
  };

  const handleTestWhatsApp = () => {
    const url = buildWhatsAppUrl(config, previewValues);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* PUBLIC CLIENT VIEW (BY DEFAULT): No headers, no editor toolbar, only form */}
      {!isEditorMode ? (
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <PublicFormView
            config={config}
            onValuesChange={(vals) => setPreviewValues(vals)}
          />
          <footer className="text-center py-8 text-xs text-slate-400 flex items-center justify-center border-t border-slate-100 mt-12 max-w-xl mx-auto">
            <span className="font-medium text-slate-400">
              🔒 Formulario oficial para WhatsApp
            </span>
          </footer>
        </main>
      ) : (
        <>
          {/* Top Bar for Admin/Owner */}
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400">Modo Constructor de Formulario</span>
              <span className="text-slate-400 hidden sm:inline">· Los cambios se guardan automáticamente</span>
            </div>
            <button
              type="button"
              onClick={closeEditor}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>👁️ Ver Formulario Público (Listo)</span>
            </button>
          </div>

          {/* Global Navigation Header (Only in Editor Mode) */}
          <Header
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onTestWhatsApp={handleTestWhatsApp}
            phoneSet={Boolean(config.targetPhone)}
          />

          {/* Main Workspace Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* TAB: BUILDER / EDITOR */}
            {currentTab === 'editor' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Builder Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Informative Welcome Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700">
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    ¡Crea tu formulario para WhatsApp con campos y texto a tu gusto!
                  </h2>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Personaliza encabezados con <strong>tamaño, negrita o cursiva</strong>, agrega preguntas marcándolas como <strong>requeridas</strong>, y configura <strong>cuadros de opciones</strong> interactivos. Todo se enviará perfectamente ordenado por WhatsApp.
                  </p>
                </div>
              </div>

              {/* Form WhatsApp Settings */}
              <FormSettings config={config} onChange={setConfig} />

              {/* Add New Elements Toolbar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Agregar elementos al formulario:</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {config.items.length} {config.items.length === 1 ? 'bloque' : 'bloques'}
                  </span>
                </div>

                {/* Quick Add Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddTextBlock('title')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-200">
                      <Type className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Encabezado / Título</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddTextBlock('normal')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-200">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Texto / Instrucción</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('text')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-200">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Texto Corto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('textarea')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-200">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Cuadro de Texto Largo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('radio')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-200">
                      <CircleDot className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Selección Única</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('checkbox')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-200">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Selección Múltiple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('select')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-200">
                      <ListOrdered className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Desplegable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('number')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 group-hover:bg-sky-200">
                      <Hash className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Número</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('date')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 group-hover:bg-sky-200">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Fecha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('phone')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 group-hover:bg-sky-200">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Teléfono</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {config.items.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Tu formulario está vacío</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Usa la barra de arriba para agregar textos con formato o campos con preguntas obligatorias.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsTemplatesOpen(true)}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Cargar una plantilla de ejemplo</span>
                    </button>
                  </div>
                ) : (
                  config.items.map((item, index) => {
                    if (item.kind === 'text') {
                      return (
                        <BlockTextEditor
                          key={item.id}
                          block={item}
                          index={index}
                          total={config.items.length}
                          onChange={(updated) => handleUpdateItem(index, updated)}
                          onDelete={() => handleDeleteItem(index)}
                          onMoveUp={() => handleMoveItem(index, 'up')}
                          onMoveDown={() => handleMoveItem(index, 'down')}
                          onDuplicate={() => handleDuplicateItem(index)}
                        />
                      );
                    }
                    return (
                      <BlockFieldEditor
                        key={item.id}
                        block={item}
                        index={index}
                        total={config.items.length}
                        onChange={(updated) => handleUpdateItem(index, updated)}
                        onDelete={() => handleDeleteItem(index)}
                        onMoveUp={() => handleMoveItem(index, 'up')}
                        onMoveDown={() => handleMoveItem(index, 'down')}
                        onDuplicate={() => handleDuplicateItem(index)}
                      />
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Button to Add */}
              {config.items.length > 0 && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleAddFieldBlock('text')}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Agregar otra pregunta</span>
                  </button>
                </div>
              )}

            </div>

            {/* Right Column: Live WhatsApp Phone Simulator (5 cols) */}
            <div className="lg:col-span-5">
              <WhatsAppPhonePreview
                config={config}
                previewValues={previewValues}
                onOpenTest={() => setCurrentTab('filler')}
              />
            </div>

          </div>
        )}

        {/* TAB: FILLER / PUBLIC TEST MODE */}
        {currentTab === 'filler' && (
          <PublicFormView
            config={config}
            onValuesChange={(vals) => setPreviewValues(vals)}
            onBackToEditor={() => setCurrentTab('editor')}
          />
        )}

      </main>

        {/* Modals */}
        <TemplateSelectorModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onSelectTemplate={(newConfig) => {
            setConfig(newConfig);
            setPreviewValues({});
          }}
        />

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          config={config}
        />
      </>
    )}
  </div>
  );
}
