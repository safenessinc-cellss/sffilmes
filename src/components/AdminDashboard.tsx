import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PortfolioItem, AppConfig } from '../types';
import { X, Save, Plus, Trash2, RotateCcw, Image, Video, Eye, EyeOff, Sparkles, Check, Pencil, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AIBudgetGenerator from './AIBudgetGenerator';
import { subscribeToAuthError } from '../lib/firestoreService';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: 'pt' | 'es';
}

export default function AdminDashboard({ isOpen, onClose, currentLang }: AdminDashboardProps) {
  const { config, portfolio, isAdmin, loginAdmin, logoutAdmin, updateConfig, updatePortfolio, resetToDefaults } = useApp();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'promo' | 'packages' | 'portfolio' | 'budget' | 'whatsapp'>('hero');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToAuthError((err) => {
      setAuthError(err);
    });
  }, []);

  // Form states initialized with context values
  const [heroForm, setHeroForm] = useState({ ...config.hero });
  const [aboutForm, setAboutForm] = useState({ ...config.about });
  const [promoForm, setPromoForm] = useState({ ...config.promotions });
  const [styleForm, setStyleForm] = useState({ ...config.style });
  const [whatsappForm, setWhatsappForm] = useState({
    active: config.whatsapp?.active ?? true,
    phoneNumber: config.whatsapp?.phoneNumber ?? "5551999999999",
    messagePt: config.whatsapp?.messagePt ?? "Olá! Gostaria de solicitar um orçamento para o meu evento.",
    messageEs: config.whatsapp?.messageEs ?? "¡Hola! Me gustaría solicitar un presupuesto para mi evento."
  });

  // Keep form states in sync with real-time config updates from Firebase
  useEffect(() => {
    if (config) {
      setHeroForm({ ...config.hero });
      setAboutForm({ ...config.about });
      setPromoForm({ ...config.promotions });
      setStyleForm({ ...config.style });
      if (config.whatsapp) {
        setWhatsappForm({
          active: config.whatsapp.active,
          phoneNumber: config.whatsapp.phoneNumber,
          messagePt: config.whatsapp.messagePt,
          messageEs: config.whatsapp.messageEs
        });
      }
    }
  }, [config]);

  // Packages state
  const [selectedCat, setSelectedCat] = useState<'casamento' | 'quinceanera' | 'infantil'>('casamento');
  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(0);
  const [pkgFeaturesPt, setPkgFeaturesPt] = useState<string>('');
  const [pkgFeaturesEs, setPkgFeaturesEs] = useState<string>('');
  const [showQuickLibrary, setShowQuickLibrary] = useState(false);

  // Portfolio local state for editing
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem[]>(portfolio);
  const [newPortfolioItem, setNewPortfolioItem] = useState<Partial<PortfolioItem>>({
    title: { pt: '', es: '' },
    category: 'casamento',
    aspectRatio: 'landscape',
    description: { pt: '', es: '' },
    year: new Date().getFullYear().toString(),
    location: '',
    url: '',
    videoUrl: ''
  });

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<PortfolioItem | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEditingPortfolio(portfolio);
    }
  }, [isOpen, portfolio]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setLoginError(false);
      setPassword('');
      // Reload values in forms on successful login
      setHeroForm({ ...config.hero });
      setAboutForm({ ...config.about });
      setPromoForm({ ...config.promotions });
      setEditingPortfolio([...portfolio]);
      if (config.whatsapp) {
        setWhatsappForm({ ...config.whatsapp });
      }
    } else {
      setLoginError(true);
    }
  };

  const handleSaveConfig = () => {
    updateConfig({
      hero: heroForm,
      about: aboutForm,
      promotions: promoForm,
      style: styleForm,
      packages: config.packages, // preserved or updated via packages edit
      whatsapp: whatsappForm
    });
    triggerSuccess();
  };

  const handleSavePortfolio = () => {
    updatePortfolio(editingPortfolio);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm(currentLang === 'pt' ? 'Tem certeza que deseja redefinir todas as alterações para os padrões do PDF?' : '¿Está seguro de que desea restablecer todos los cambios a los valores del PDF?')) {
      resetToDefaults();
      onClose();
      window.location.reload();
    }
  };

  // Portfolio edit handlers
  const handleAddPortfolioItem = () => {
    if (!newPortfolioItem.url) {
      alert(currentLang === 'pt' ? 'Por favor, insira pelo menos a URL da imagem de capa.' : 'Por favor, ingrese al menos la URL de la imagen de portada.');
      return;
    }
    const item: PortfolioItem = {
      id: `custom-${Date.now()}`,
      url: newPortfolioItem.url,
      videoUrl: newPortfolioItem.videoUrl || '',
      title: {
        pt: newPortfolioItem.title?.pt || 'Sem Título',
        es: newPortfolioItem.title?.es || 'Sin Título'
      },
      category: newPortfolioItem.category || 'casamento',
      aspectRatio: newPortfolioItem.aspectRatio || 'landscape',
      description: {
        pt: newPortfolioItem.description?.pt || '',
        es: newPortfolioItem.description?.es || ''
      },
      year: newPortfolioItem.year || '2026',
      location: newPortfolioItem.location || ''
    };

    const updated = [item, ...editingPortfolio];
    setEditingPortfolio(updated);
    updatePortfolio(updated);
    
    // Clear new item form
    setNewPortfolioItem({
      title: { pt: '', es: '' },
      category: 'casamento',
      aspectRatio: 'landscape',
      description: { pt: '', es: '' },
      year: '2026',
      location: '',
      url: '',
      videoUrl: ''
    });
    triggerSuccess();
  };

  const handleDeletePortfolioItem = (id: string) => {
    const updated = editingPortfolio.filter(item => item.id !== id);
    setEditingPortfolio(updated);
    updatePortfolio(updated);
    triggerSuccess();
  };

  const handleStartEdit = (item: PortfolioItem) => {
    setEditingItemId(item.id);
    setEditItemForm(JSON.parse(JSON.stringify(item))); // Deep copy
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditItemForm(null);
  };

  const handleSaveEditedItem = () => {
    if (!editItemForm) return;
    const updated = editingPortfolio.map(item => item.id === editItemForm.id ? editItemForm : item);
    setEditingPortfolio(updated);
    updatePortfolio(updated);
    setEditingItemId(null);
    setEditItemForm(null);
    triggerSuccess();
  };

  // Packages edit handlers
  const currentPackage = config.packages[selectedCat]?.[selectedPkgIndex];

  const handleUpdatePackageField = (field: string, val: any) => {
    const updatedPackages = { ...config.packages };
    updatedPackages[selectedCat][selectedPkgIndex] = {
      ...updatedPackages[selectedCat][selectedPkgIndex],
      [field]: val
    };
    updateConfig({
      ...config,
      packages: updatedPackages
    });
    triggerSuccess();
  };

  const handleAddFeature = (lang: 'pt' | 'es') => {
    const currentFeatures = lang === 'pt' ? [...currentPackage.featuresPt] : [...currentPackage.featuresEs];
    const newFeature = lang === 'pt' ? pkgFeaturesPt : pkgFeaturesEs;
    
    if (!newFeature.trim()) return;

    currentFeatures.push(newFeature.trim());

    if (lang === 'pt') {
      handleUpdatePackageField('featuresPt', currentFeatures);
      setPkgFeaturesPt('');
    } else {
      handleUpdatePackageField('featuresEs', currentFeatures);
      setPkgFeaturesEs('');
    }
  };

  const handleRemoveFeature = (lang: 'pt' | 'es', index: number) => {
    const currentFeatures = lang === 'pt' ? [...currentPackage.featuresPt] : [...currentPackage.featuresEs];
    currentFeatures.splice(index, 1);
    
    if (lang === 'pt') {
      handleUpdatePackageField('featuresPt', currentFeatures);
    } else {
      handleUpdatePackageField('featuresEs', currentFeatures);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-10 select-text">
      <div className="relative w-full max-w-5xl bg-[#FDFCFB] border border-[#C9A96E]/20 text-[#141414] shadow-2xl rounded-sm flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-[#F0EFEA] flex justify-between items-center bg-[#FDFCFB]">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-[#C9A96E]" />
            <h2 className="font-serif italic text-xl tracking-tight text-[#141414]">
              ST Filmes &mdash; {currentLang === 'pt' ? 'Painel Administrativo' : 'Panel de Administración'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-xs font-mono text-stone-500 hover:text-red-600 transition-colors bg-stone-100 px-3 py-1.5 rounded"
              title="Restaurar dados originais dos PDFs"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{currentLang === 'pt' ? 'Padrões PDF' : 'Valores PDF'}</span>
            </button>
            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-[#141414] transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Saved Success Notification banner inside dialog */}
        {saveSuccess && (
          <div className="bg-[#C9A96E]/10 border-b border-[#C9A96E]/30 px-6 py-2 flex items-center justify-center space-x-2 text-xs font-sans text-[#C9A96E] font-medium animate-pulse">
            <Check className="h-4 w-4" />
            <span>{currentLang === 'pt' ? 'Alterações salvas com sucesso em tempo real!' : '¡Cambios guardados con éxito en tiempo real!'}</span>
          </div>
        )}

        {/* LOGIN GATE */}
        {!isAdmin ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 text-center">
              <div className="space-y-2">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C9A96E]">RESTRITO / PRIVADO</span>
                <h3 className="font-serif text-2xl text-[#141414]">Acesso ao Dashboard</h3>
                <p className="text-xs text-stone-500 font-sans px-4">
                  {currentLang === 'pt' 
                    ? 'Insira a senha de administrador da ST Filmes para editar a portada, promoções, pacotes e portfólio.'
                    : 'Ingresa la contraseña de administrador de ST Filmes para editar la portada, promociones, paquetes y portafolio.'}
                </p>
                <div className="pt-2">
                  <code className="bg-stone-100 px-2.5 py-1 rounded text-[10px] font-mono text-stone-600">
                    {currentLang === 'pt' ? 'Senha padrão: admin' : 'Contraseña por defecto: admin'}
                  </code>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#FDFCFB] border text-center text-sm font-sans text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] ${
                    loginError ? 'border-red-400 focus:ring-red-400' : 'border-[#F0EFEA] focus:border-[#C9A96E]'
                  }`}
                  placeholder={currentLang === 'pt' ? 'Digite a senha' : 'Digite la contraseña'}
                  autoFocus
                />
                {loginError && (
                  <p className="text-[11px] text-red-500 font-sans text-center">
                    {currentLang === 'pt' ? 'Senha incorreta. Tente "admin" ou "stfilmes".' : 'Contraseña incorrecta. Intente "admin" o "stfilmes".'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#141414] hover:bg-[#C9A96E] text-white font-sans text-xs tracking-[0.25em] uppercase py-3.5 font-semibold transition-colors duration-300 cursor-pointer shadow-xs"
              >
                {currentLang === 'pt' ? 'Entrar' : 'Ingresar'}
              </button>
            </form>
          </div>
        ) : (
          /* MAIN EDITING CONTENT */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-1/4 border-r border-[#F0EFEA] bg-[#FDFCFB] flex flex-col justify-between">
              <div className="flex-1 py-4">
                <ul className="space-y-1 px-2 text-xs font-mono uppercase tracking-wider text-stone-600">
                  <li>
                    <button
                      onClick={() => setActiveTab('hero')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'hero' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      📺 {currentLang === 'pt' ? 'Portada / Capa' : 'Portada / Capa'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('about')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'about' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      👩 {currentLang === 'pt' ? 'Sobre Steffany' : 'Sobre Steffany'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('promo')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'promo' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      🎉 {currentLang === 'pt' ? 'Promoções' : 'Promociones'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('packages')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'packages' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      💼 {currentLang === 'pt' ? 'Pacotes de Eventos' : 'Paquetes de Eventos'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'portfolio' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      🎬 {currentLang === 'pt' ? 'Portfólio / Obras' : 'Portafolio / Obras'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('budget')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'budget' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      💡 {currentLang === 'pt' ? 'Gerador de Orçamentos IA' : 'Generador de Presupuestos IA'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('whatsapp')}
                      className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === 'whatsapp' 
                          ? 'bg-[#C9A96E]/10 text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]' 
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      💬 {currentLang === 'pt' ? 'WhatsApp & Asistente' : 'WhatsApp & Asistente'}
                    </button>
                  </li>
                </ul>
              </div>

              {authError && authError.includes('configuration-not-found') && (
                <div className="mx-4 my-2 p-3 bg-amber-50 border border-amber-200/60 rounded text-[10px] text-stone-700 leading-normal">
                  <div className="flex items-center space-x-1.5 font-serif italic text-amber-900 font-semibold mb-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                    <span>Firebase Auth</span>
                  </div>
                  <p>
                    {currentLang === 'pt' 
                      ? 'Ative o provedor de login "Anônimo" no painel do seu Firebase Console para ativar a segurança criptográfica de dados.' 
                      : 'Active el proveedor de acceso "Anónimo" en su Firebase Console para habilitar la seguridad criptográfica de datos.'}
                  </p>
                </div>
              )}

              {/* Logout button at bottom of sidebar */}
              <div className="p-4 border-t border-[#F0EFEA] text-center">
                <button
                  onClick={logoutAdmin}
                  className="text-[10px] font-mono uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
                >
                  [{currentLang === 'pt' ? 'Sair do Painel' : 'Salir del Panel'}]
                </button>
              </div>
            </div>

            {/* Editing Pane */}
            <div className="w-3/4 p-6 overflow-y-auto bg-stone-50/50">
              
              {/* TAB 1: HERO / PORTADA */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="border-b border-[#F0EFEA] pb-3">
                    <h4 className="font-serif text-lg italic text-[#141414]">Configuração da Capa / Portada</h4>
                    <p className="text-xs text-stone-500">Altere o banner de apresentação principal e títulos da ST Filmes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Título Principal (PT)</label>
                      <input
                        type="text"
                        value={heroForm.titlePt}
                        onChange={(e) => setHeroForm({ ...heroForm, titlePt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Título Principal (ES)</label>
                      <input
                        type="text"
                        value={heroForm.titleEs}
                        onChange={(e) => setHeroForm({ ...heroForm, titleEs: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Destaque Itálico (PT)</label>
                      <input
                        type="text"
                        value={heroForm.titleHighlightPt}
                        onChange={(e) => setHeroForm({ ...heroForm, titleHighlightPt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E] text-[#C9A96E] font-serif italic"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Destaque Itálico (ES)</label>
                      <input
                        type="text"
                        value={heroForm.titleHighlightEs}
                        onChange={(e) => setHeroForm({ ...heroForm, titleHighlightEs: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E] text-[#C9A96E] font-serif italic"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Sub-tagline (PT)</label>
                      <input
                        type="text"
                        value={heroForm.subPt}
                        onChange={(e) => setHeroForm({ ...heroForm, subPt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Sub-tagline (ES)</label>
                      <input
                        type="text"
                        value={heroForm.subEs}
                        onChange={(e) => setHeroForm({ ...heroForm, subEs: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Imagem de Fundo URL (Unsplash ou similar)</label>
                      <input
                        type="text"
                        value={heroForm.imageUrl}
                        onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-[#141414] hover:bg-[#C9A96E] text-white px-5 py-2.5 rounded font-sans text-xs tracking-wider uppercase font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{currentLang === 'pt' ? 'Salvar Capa' : 'Guardar Portada'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT / STEFFANY */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="border-b border-[#F0EFEA] pb-3">
                    <h4 className="font-serif text-lg italic text-[#141414]">Biografia de Steffany (Sobre Mim)</h4>
                    <p className="text-xs text-stone-500">Edite as informações biográficas e estatísticas do estúdio extraídas dos PDFs.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Título / Saudação (PT)</label>
                        <input
                          type="text"
                          value={aboutForm.titlePt}
                          onChange={(e) => setAboutForm({ ...aboutForm, titlePt: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Título / Saudação (ES)</label>
                        <input
                          type="text"
                          value={aboutForm.titleEs}
                          onChange={(e) => setAboutForm({ ...aboutForm, titleEs: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Sub-tagline (PT)</label>
                        <input
                          type="text"
                          value={aboutForm.subtitlePt}
                          onChange={(e) => setAboutForm({ ...aboutForm, subtitlePt: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Sub-tagline (ES)</label>
                        <input
                          type="text"
                          value={aboutForm.subtitleEs}
                          onChange={(e) => setAboutForm({ ...aboutForm, subtitleEs: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Parágrafo 1 (PT)</label>
                      <textarea
                        rows={2}
                        value={aboutForm.bioText1Pt}
                        onChange={(e) => setAboutForm({ ...aboutForm, bioText1Pt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E] resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Parágrafo 1 (ES)</label>
                      <textarea
                        rows={2}
                        value={aboutForm.bioText1Es}
                        onChange={(e) => setAboutForm({ ...aboutForm, bioText1Es: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E] resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Parágrafo 2 - Emoções/Luz (PT)</label>
                      <textarea
                        rows={2}
                        value={aboutForm.bioText2Pt}
                        onChange={(e) => setAboutForm({ ...aboutForm, bioText2Pt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E] resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Parágrafo 2 - Emoções/Luz (ES)</label>
                      <textarea
                        rows={2}
                        value={aboutForm.bioText2Es}
                        onChange={(e) => setAboutForm({ ...aboutForm, bioText2Es: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E] resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Parágrafo 3 - Convite (PT)</label>
                      <input
                        type="text"
                        value={aboutForm.bioText3Pt}
                        onChange={(e) => setAboutForm({ ...aboutForm, bioText3Pt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Parágrafo 3 - Convite (ES)</label>
                      <input
                        type="text"
                        value={aboutForm.bioText3Es}
                        onChange={(e) => setAboutForm({ ...aboutForm, bioText3Es: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Foto Biografia URL (Steffany)</label>
                      <input
                        type="text"
                        value={aboutForm.imageUrl}
                        onChange={(e) => setAboutForm({ ...aboutForm, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-[#F0EFEA] pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Anos de Experiência</label>
                        <input
                          type="text"
                          value={aboutForm.statsYears}
                          onChange={(e) => setAboutForm({ ...aboutForm, statsYears: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-[#F0EFEA] rounded text-sm text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Projetos Concluídos</label>
                        <input
                          type="text"
                          value={aboutForm.statsProjects}
                          onChange={(e) => setAboutForm({ ...aboutForm, statsProjects: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-[#F0EFEA] rounded text-sm text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Prêmios / Destaques</label>
                        <input
                          type="text"
                          value={aboutForm.statsAwards}
                          onChange={(e) => setAboutForm({ ...aboutForm, statsAwards: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-[#F0EFEA] rounded text-sm text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-[#141414] hover:bg-[#C9A96E] text-white px-5 py-2.5 rounded font-sans text-xs tracking-wider uppercase font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{currentLang === 'pt' ? 'Salvar Biografia' : 'Guardar Biografía'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PROMOTIONS */}
              {activeTab === 'promo' && (
                <div className="space-y-6">
                  <div className="border-b border-[#F0EFEA] pb-3">
                    <h4 className="font-serif text-lg italic text-[#141414]">Faixa de Promoções & Campanhas</h4>
                    <p className="text-xs text-stone-500">Configure um anúncio ativo para casamentos, 15 anos ou datas comemorativas.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-white p-3 rounded border border-[#F0EFEA]">
                      <input
                        type="checkbox"
                        id="promo-active"
                        checked={promoForm.active}
                        onChange={(e) => setPromoForm({ ...promoForm, active: e.target.checked })}
                        className="h-4 w-4 text-[#C9A96E] border-stone-300 focus:ring-[#C9A96E]"
                      />
                      <label htmlFor="promo-active" className="text-xs font-mono uppercase tracking-wider text-[#141414] font-semibold cursor-pointer">
                        {currentLang === 'pt' ? 'Ativar Faixa Promocional no Topo' : 'Activar Banner Promocional en la Cima'}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Distintivo / Badge (PT)</label>
                        <input
                          type="text"
                          value={promoForm.badgePt}
                          onChange={(e) => setPromoForm({ ...promoForm, badgePt: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Distintivo / Badge (ES)</label>
                        <input
                          type="text"
                          value={promoForm.badgeEs}
                          onChange={(e) => setPromoForm({ ...promoForm, badgeEs: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Título Promo (PT)</label>
                        <input
                          type="text"
                          value={promoForm.titlePt}
                          onChange={(e) => setPromoForm({ ...promoForm, titlePt: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Título Promo (ES)</label>
                        <input
                          type="text"
                          value={promoForm.titleEs}
                          onChange={(e) => setPromoForm({ ...promoForm, titleEs: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Descrição / Regulamento (PT)</label>
                        <textarea
                          rows={3}
                          value={promoForm.descriptionPt}
                          onChange={(e) => setPromoForm({ ...promoForm, descriptionPt: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Descripción / Reglamento (ES)</label>
                        <textarea
                          rows={3}
                          value={promoForm.descriptionEs}
                          onChange={(e) => setPromoForm({ ...promoForm, descriptionEs: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-[#141414] hover:bg-[#C9A96E] text-white px-5 py-2.5 rounded font-sans text-xs tracking-wider uppercase font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{currentLang === 'pt' ? 'Salvar Promoção' : 'Guardar Promoción'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PACKAGES */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div className="border-b border-[#F0EFEA] pb-3">
                    <h4 className="font-serif text-lg italic text-[#141414]">Configuração de Pacotes Sociais</h4>
                    <p className="text-xs text-stone-500">Modifique os itens inclusos e detalhes para Casamentos, 15 Anos e Festas Infantis.</p>
                  </div>

                  {/* Category select */}
                  <div className="flex border-b border-[#F0EFEA]">
                    <button
                      onClick={() => { setSelectedCat('casamento'); setSelectedPkgIndex(0); }}
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 ${
                        selectedCat === 'casamento' ? 'border-[#C9A96E] text-[#C9A96E] font-bold' : 'border-transparent text-stone-400'
                      }`}
                    >
                      💍 {currentLang === 'pt' ? 'Casamentos' : 'Bodas'}
                    </button>
                    <button
                      onClick={() => { setSelectedCat('quinceanera'); setSelectedPkgIndex(0); }}
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 ${
                        selectedCat === 'quinceanera' ? 'border-[#C9A96E] text-[#C9A96E] font-bold' : 'border-transparent text-stone-400'
                      }`}
                    >
                      👑 15 Anos / XV
                    </button>
                    <button
                      onClick={() => { setSelectedCat('infantil'); setSelectedPkgIndex(0); }}
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 ${
                        selectedCat === 'infantil' ? 'border-[#C9A96E] text-[#C9A96E] font-bold' : 'border-transparent text-stone-400'
                      }`}
                    >
                      🎈 {currentLang === 'pt' ? 'Infantil' : 'Infantil'}
                    </button>
                  </div>

                  {/* Package index select */}
                  <div className="flex space-x-2 bg-stone-100 p-1.5 rounded">
                    {config.packages[selectedCat]?.map((pkg, i) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPkgIndex(i)}
                        className={`flex-1 text-center py-1.5 rounded text-xs font-sans transition-all duration-200 ${
                          selectedPkgIndex === i ? 'bg-white shadow-xs font-semibold text-[#141414]' : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        {currentLang === 'pt' ? pkg.namePt : pkg.nameEs}
                      </button>
                    ))}
                  </div>

                  {/* Edit current package form */}
                  {currentPackage && (
                    <div className="space-y-4 bg-white p-4 border border-[#F0EFEA] rounded">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-500">Nome do Pacote (PT)</label>
                          <input
                            type="text"
                            value={currentPackage.namePt}
                            onChange={(e) => handleUpdatePackageField('namePt', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-500">Nombre del Paquete (ES)</label>
                          <input
                            type="text"
                            value={currentPackage.nameEs}
                            onChange={(e) => handleUpdatePackageField('nameEs', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-mono uppercase text-stone-500">Descrição Curta (PT)</label>
                          <input
                            type="text"
                            value={currentPackage.descriptionPt}
                            onChange={(e) => handleUpdatePackageField('descriptionPt', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-mono uppercase text-stone-500">Descripción Corta (ES)</label>
                          <input
                            type="text"
                            value={currentPackage.descriptionEs}
                            onChange={(e) => handleUpdatePackageField('descriptionEs', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          />
                        </div>

                        {/* Optional Prices - Hidden by user request on frontend but editable here */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-500">Preço Opcional (R$ / €)</label>
                          <input
                            type="text"
                            value={currentPackage.price || ''}
                            onChange={(e) => handleUpdatePackageField('price', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                            placeholder="Ex: R$ 600"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-5">
                          <input
                            type="checkbox"
                            id="show-price"
                            checked={currentPackage.showPrice || false}
                            onChange={(e) => handleUpdatePackageField('showPrice', e.target.checked)}
                            className="h-4 w-4 rounded text-[#C9A96E]"
                          />
                          <label htmlFor="show-price" className="text-[11px] font-mono uppercase text-stone-600">
                            {currentLang === 'pt' ? 'Exibir preço ao público' : 'Mostrar precio al público'}
                          </label>
                        </div>
                      </div>

                      {/* FEATURES LIST EDITING */}
                      <div className="border-t border-stone-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* PORTUGUESE FEATURES */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-[#C9A96E] font-bold block">Recursos / Cobertura (PT)</label>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto bg-stone-50 p-2 border border-stone-200 rounded">
                            {currentPackage.featuresPt.map((feature, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-1.5 border border-stone-100 rounded">
                                <span className="flex-1 pr-2 leading-tight">{feature}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature('pt', idx)}
                                  className="text-stone-300 hover:text-red-500 p-0.5"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={pkgFeaturesPt}
                              onChange={(e) => setPkgFeaturesPt(e.target.value)}
                              className="flex-1 px-2 py-1 bg-white border border-stone-200 rounded text-xs"
                              placeholder="Adicionar cobertura em PT..."
                              onKeyDown={(e) => e.key === 'Enter' && handleAddFeature('pt')}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddFeature('pt')}
                              className="bg-[#C9A96E] text-white p-1.5 rounded hover:bg-[#B59459]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* ESPANOL FEATURES */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-[#C9A96E] font-bold block">Recursos / Cobertura (ES)</label>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto bg-stone-50 p-2 border border-stone-200 rounded">
                            {currentPackage.featuresEs.map((feature, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-1.5 border border-stone-100 rounded">
                                <span className="flex-1 pr-2 leading-tight">{feature}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature('es', idx)}
                                  className="text-stone-300 hover:text-red-500 p-0.5"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={pkgFeaturesEs}
                              onChange={(e) => setPkgFeaturesEs(e.target.value)}
                              className="flex-1 px-2 py-1 bg-white border border-stone-200 rounded text-xs"
                              placeholder="Adicionar cobertura en ES..."
                              onKeyDown={(e) => e.key === 'Enter' && handleAddFeature('es')}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddFeature('es')}
                              className="bg-[#C9A96E] text-white p-1.5 rounded hover:bg-[#B59459]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PORTFOLIO / GALLERIES */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div className="border-b border-[#F0EFEA] pb-3">
                    <h4 className="font-serif text-lg italic text-[#141414]">Gerenciamento de Obras & Vídeos</h4>
                    <p className="text-xs text-stone-500">Adicione e remova vídeos de eventos ou fotografias do portfólio.</p>
                  </div>

                  {/* Collapsible Quick Image Library */}
                  <div className="border border-stone-200 bg-stone-50 rounded p-4">
                    <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShowQuickLibrary(!showQuickLibrary)}>
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-[#C9A96E]" />
                        <span className="text-xs font-mono uppercase tracking-wider text-stone-700 font-semibold">
                          {currentLang === 'pt' ? '📁 Galeria de Sugestões de Fotos (Unsplash)' : '📁 Galería de Sugerencias de Fotos (Unsplash)'}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#C9A96E] hover:underline font-bold">
                        {showQuickLibrary 
                          ? (currentLang === 'pt' ? '[ Ocultar ]' : '[ Ocultar ]')
                          : (currentLang === 'pt' ? '[ Mostrar ]' : '[ Mostrar ]')}
                      </span>
                    </div>

                    {showQuickLibrary && (
                      <div className="mt-4 space-y-4">
                        <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                          {currentLang === 'pt' 
                            ? 'Escolha entre as fotos recomendadas abaixo para colocar no seu portfólio. Clique para inserir diretamente no formulário de Nova Obra ou copie o link:'
                            : 'Elija entre las fotos recomendadas a continuación para colocarlas en su portafolio. Haga clic para insertar directamente en el formulario de Nueva Obra o copie el enlace:'}
                        </p>

                        {/* Weddings */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E] font-bold">💍 {currentLang === 'pt' ? 'Casamentos' : 'Bodas'}</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Casamento Clássico 1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Abraço Noivos', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Mãos Dadas', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Caminho no Bosque', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200' }
                            ].map((pic, idx) => (
                              <div key={idx} className="group relative bg-white border border-stone-200 rounded overflow-hidden shadow-xs">
                                <img src={pic.url} alt="" className="w-full h-14 object-cover filter grayscale hover:grayscale-0 transition-all duration-300 pointer-events-none" />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center space-y-1 transition-opacity duration-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewPortfolioItem(prev => ({ ...prev, url: pic.url }));
                                      triggerSuccess();
                                    }}
                                    className="px-1.5 py-0.5 bg-[#C9A96E] hover:bg-[#B59459] text-white text-[8px] font-mono uppercase rounded-xs"
                                  >
                                    {currentLang === 'pt' ? 'Inserir' : 'Insertar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(pic.url);
                                      alert(currentLang === 'pt' ? 'Link copiado!' : '¡Enlace copiado!');
                                    }}
                                    className="px-1.5 py-0.5 bg-stone-800 text-white text-[8px] font-mono uppercase rounded-xs"
                                  >
                                    Copy URL
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quinceanera / 15 Anos */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E] font-bold">👑 15 Anos</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Vestido de Gala', url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Festa de Debutante', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Dança das Velas', url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Neon Party', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200' }
                            ].map((pic, idx) => (
                              <div key={idx} className="group relative bg-white border border-stone-200 rounded overflow-hidden shadow-xs">
                                <img src={pic.url} alt="" className="w-full h-14 object-cover filter grayscale hover:grayscale-0 transition-all duration-300 pointer-events-none" />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center space-y-1 transition-opacity duration-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewPortfolioItem(prev => ({ ...prev, url: pic.url }));
                                      triggerSuccess();
                                    }}
                                    className="px-1.5 py-0.5 bg-[#C9A96E] hover:bg-[#B59459] text-white text-[8px] font-mono uppercase rounded-xs"
                                  >
                                    {currentLang === 'pt' ? 'Inserir' : 'Insertar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(pic.url);
                                      alert(currentLang === 'pt' ? 'Link copiado!' : '¡Enlace copiado!');
                                    }}
                                    className="px-1.5 py-0.5 bg-stone-800 text-white text-[8px] font-mono uppercase rounded-xs"
                                  >
                                    Copy URL
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Kids / Infantil */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E] font-bold">🎈 {currentLang === 'pt' ? 'Infantil' : 'Infantil'}</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Soprando Vela', url: 'https://images.unsplash.com/photo-1530124560677-bdaea9221911?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Baloes Decoracao', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Gargalhada', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=1200' },
                              { label: 'Brincadeira', url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=1200' }
                            ].map((pic, idx) => (
                              <div key={idx} className="group relative bg-white border border-stone-200 rounded overflow-hidden shadow-xs">
                                <img src={pic.url} alt="" className="w-full h-14 object-cover filter grayscale hover:grayscale-0 transition-all duration-300 pointer-events-none" />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center space-y-1 transition-opacity duration-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewPortfolioItem(prev => ({ ...prev, url: pic.url }));
                                      triggerSuccess();
                                    }}
                                    className="px-1.5 py-0.5 bg-[#C9A96E] hover:bg-[#B59459] text-white text-[8px] font-mono uppercase rounded-xs"
                                  >
                                    {currentLang === 'pt' ? 'Inserir' : 'Insertar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(pic.url);
                                      alert(currentLang === 'pt' ? 'Link copiado!' : '¡Enlace copiado!');
                                    }}
                                    className="px-1.5 py-0.5 bg-stone-800 text-white text-[8px] font-mono uppercase rounded-xs"
                                  >
                                    Copy URL
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Add Portfolio Item block */}
                  <div className="bg-white p-4 border border-[#C9A96E]/20 rounded space-y-4">
                    <h5 className="font-serif italic text-sm text-[#141414] flex items-center space-x-2">
                      <Plus className="h-4 w-4 text-[#C9A96E]" />
                      <span>{currentLang === 'pt' ? 'Adicionar Novo Item ao Portfólio' : 'Añadir Nuevo Item al Portafolio'}</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Título (PT)</label>
                        <input
                          type="text"
                          value={newPortfolioItem.title?.pt || ''}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            title: { ...(newPortfolioItem.title || { es: '' }), pt: e.target.value }
                          })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Título (ES)</label>
                        <input
                          type="text"
                          value={newPortfolioItem.title?.es || ''}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            title: { ...(newPortfolioItem.title || { pt: '' }), es: e.target.value }
                          })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Categoria / Tipo</label>
                        <select
                          value={newPortfolioItem.category || 'casamento'}
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, category: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        >
                          <option value="casamento">💍 {currentLang === 'pt' ? 'Casamento' : 'Boda'}</option>
                          <option value="15anos">👑 15 Anos</option>
                          <option value="infantil">🎈 {currentLang === 'pt' ? 'Festa Infantil' : 'Fiesta Infantil'}</option>
                          <option value="cinematic">🎥 Cinematic / Outro</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Formato Visual (Razão de Aspeto)</label>
                        <select
                          value={newPortfolioItem.aspectRatio || 'landscape'}
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, aspectRatio: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        >
                          <option value="landscape">Landscape (Horizontal 3:2)</option>
                          <option value="portrait">Portrait (Vertical 2:3)</option>
                          <option value="square">Square (Quadrado 1:1)</option>
                          <option value="wide">Cinema Wide (Panorâmico 16:9)</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Imagem de Capa URL (Unsplash ou capa do vídeo)</label>
                        <input
                          type="text"
                          value={newPortfolioItem.url || ''}
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, url: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-stone-500">
                          {currentLang === 'pt' ? 'URL do Vídeo Incorporado (Opcional - Ex: YouTube Embed)' : 'URL del Video Incrustado (Opcional - Ej: YouTube Embed)'}
                        </label>
                        <input
                          type="text"
                          value={newPortfolioItem.videoUrl || ''}
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, videoUrl: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          placeholder="Ex: https://www.youtube.com/embed/g09U7p2uicY"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Ano</label>
                        <input
                          type="text"
                          value={newPortfolioItem.year || ''}
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, year: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Localização / Cidade</label>
                        <input
                          type="text"
                          value={newPortfolioItem.location || ''}
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, location: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          placeholder="Ex: Lisboa, Portugal"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Descrição Curta (PT)</label>
                        <input
                          type="text"
                          value={newPortfolioItem.description?.pt || ''}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            description: { ...(newPortfolioItem.description || { es: '' }), pt: e.target.value }
                          })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-stone-500">Descripción Corta (ES)</label>
                        <input
                          type="text"
                          value={newPortfolioItem.description?.es || ''}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            description: { ...(newPortfolioItem.description || { pt: '' }), es: e.target.value }
                          })}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPortfolioItem}
                      className="bg-[#C9A96E] hover:bg-[#B59459] text-white px-4 py-2 rounded font-sans text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{currentLang === 'pt' ? 'Inserir no Portfólio' : 'Insertar en Portafolio'}</span>
                    </button>
                  </div>

                  {/* Portfolio grid display with delete triggers */}
                  <div className="border-t border-[#F0EFEA] pt-4">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-3">
                      {currentLang === 'pt' ? 'Obras Atuais no Portfólio' : 'Obras Actuales en el Portafolio'} ({editingPortfolio.length})
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {editingPortfolio.map((item) => {
                        const isEditingThis = editingItemId === item.id && editItemForm;

                        if (isEditingThis && editItemForm) {
                          return (
                            <div key={item.id} className="col-span-full bg-white border border-[#C9A96E]/40 rounded p-4 md:p-6 space-y-4 shadow-md">
                              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <h5 className="font-serif italic text-sm text-[#C9A96E] font-semibold flex items-center space-x-2">
                                  <Sparkles className="h-4 w-4" />
                                  <span>{currentLang === 'pt' ? 'Editar Obra / Vídeo' : 'Editar Obra / Video'}</span>
                                </h5>
                                <span className="font-mono text-[9px] text-stone-400">ID: {item.id}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Título (PT)</label>
                                  <input
                                    type="text"
                                    value={editItemForm.title.pt}
                                    onChange={(e) => setEditItemForm({
                                      ...editItemForm,
                                      title: { ...editItemForm.title, pt: e.target.value }
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Título (ES)</label>
                                  <input
                                    type="text"
                                    value={editItemForm.title.es}
                                    onChange={(e) => setEditItemForm({
                                      ...editItemForm,
                                      title: { ...editItemForm.title, es: e.target.value }
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Categoria / Tipo</label>
                                  <select
                                    value={editItemForm.category}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, category: e.target.value as any })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  >
                                    <option value="casamento">💍 {currentLang === 'pt' ? 'Casamento' : 'Boda'}</option>
                                    <option value="15anos">👑 15 Anos</option>
                                    <option value="infantil">🎈 {currentLang === 'pt' ? 'Festa Infantil' : 'Fiesta Infantil'}</option>
                                    <option value="cinematic">🎥 Cinematic / Outro</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Formato Visual (Razão de Aspeto)</label>
                                  <select
                                    value={editItemForm.aspectRatio}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, aspectRatio: e.target.value as any })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  >
                                    <option value="landscape">Landscape (Horizontal 3:2)</option>
                                    <option value="portrait">Portrait (Vertical 2:3)</option>
                                    <option value="square">Square (Quadrado 1:1)</option>
                                    <option value="wide">Cinema Wide (Panorâmico 16:9)</option>
                                  </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Imagem de Capa URL</label>
                                  <input
                                    type="text"
                                    value={editItemForm.url}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, url: e.target.value })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">
                                    {currentLang === 'pt' ? 'URL do Vídeo Incorporado (Opcional - Ex: YouTube Embed)' : 'URL del Video Incrustado (Opcional - Ej: YouTube Embed)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editItemForm.videoUrl || ''}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, videoUrl: e.target.value })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                    placeholder="Ex: https://www.youtube.com/embed/g09U7p2uicY"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Ano</label>
                                  <input
                                    type="text"
                                    value={editItemForm.year}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, year: e.target.value })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Localização / Cidade</label>
                                  <input
                                    type="text"
                                    value={editItemForm.location}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, location: e.target.value })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Descrição Curta (PT)</label>
                                  <input
                                    type="text"
                                    value={editItemForm.description.pt}
                                    onChange={(e) => setEditItemForm({
                                      ...editItemForm,
                                      description: { ...editItemForm.description, pt: e.target.value }
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-mono uppercase text-stone-500">Descripción Corta (ES)</label>
                                  <input
                                    type="text"
                                    value={editItemForm.description.es}
                                    onChange={(e) => setEditItemForm({
                                      ...editItemForm,
                                      description: { ...editItemForm.description, es: e.target.value }
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-[#C9A96E]"
                                  />
                                </div>
                              </div>

                              <div className="flex space-x-3 pt-2">
                                <button
                                  type="button"
                                  onClick={handleSaveEditedItem}
                                  className="bg-[#C9A96E] hover:bg-[#B59459] text-white px-4 py-2 rounded font-sans text-xs uppercase tracking-wider font-semibold flex items-center space-x-1"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  <span>{currentLang === 'pt' ? 'Salvar Obra' : 'Guardar Obra'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded font-sans text-xs uppercase tracking-wider font-semibold"
                                >
                                  {currentLang === 'pt' ? 'Cancelar' : 'Cancelar'}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={item.id} className="bg-white border border-stone-200 rounded overflow-hidden shadow-xs relative group flex flex-col justify-between">
                            <div>
                              <div className="relative">
                                <img
                                  src={item.url}
                                  alt=""
                                  className="w-full h-28 object-cover filter grayscale"
                                />
                                <div className="absolute top-2 left-2 flex space-x-1">
                                  <span className="bg-black/70 text-white text-[8px] font-mono uppercase px-1.5 py-0.5 rounded flex items-center space-x-1">
                                    {item.videoUrl ? <Video className="h-2 w-2 text-red-400" /> : <Image className="h-2 w-2 text-blue-400" />}
                                    <span>{item.category}</span>
                                  </span>
                                </div>

                                <div className="absolute top-2 right-2 flex space-x-1 bg-black/60 p-1 rounded backdrop-blur-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="bg-[#C9A96E] hover:bg-[#B59459] text-white p-1 rounded transition-colors"
                                    title={currentLang === 'pt' ? 'Editar Item' : 'Editar Item'}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePortfolioItem(item.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors"
                                    title="Deletar Item"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="p-2.5">
                                <h6 className="font-serif text-xs font-semibold text-[#141414] truncate">
                                  {currentLang === 'pt' ? item.title.pt : item.title.es}
                                </h6>
                                <p className="text-[10px] text-stone-400 font-sans truncate">
                                  {item.location} &bull; {item.year}
                                </p>
                              </div>
                            </div>

                            <div className="px-2.5 pb-2.5">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                className="w-full py-1 text-center bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-[10px] font-mono uppercase tracking-wider text-stone-600 hover:text-[#C9A96E] transition-all duration-200"
                              >
                                ✏️ {currentLang === 'pt' ? 'Editar Obra' : 'Editar Obra'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'budget' && (
                <AIBudgetGenerator currentLang={currentLang} />
              )}

              {activeTab === 'whatsapp' && (
                <div className="space-y-6">
                  <div className="border-b border-[#F0EFEA] pb-3">
                    <h4 className="font-serif text-lg italic text-[#141414]">WhatsApp & Asistente de Contacto IA</h4>
                    <p className="text-xs text-stone-500">Configure o botão flutuante de WhatsApp do seu portfólio e as mensagens padrão.</p>
                  </div>

                  <div className="bg-white p-5 rounded border border-[#F0EFEA] space-y-5">
                    
                    {/* Active Checkbox */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="whatsapp-active"
                        checked={whatsappForm.active}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, active: e.target.checked })}
                        className="h-4 w-4 mt-0.5 rounded border-stone-300 text-[#C9A96E] focus:ring-[#C9A96E]"
                      />
                      <div>
                        <label htmlFor="whatsapp-active" className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block cursor-pointer">
                          Ativar Botão do WhatsApp & Chat IA
                        </label>
                        <p className="text-[11px] text-stone-400">
                          Se ativado, um botão de chat flutuante será visível para todos os visitantes no canto inferior direito do site.
                        </p>
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block">Número do WhatsApp (Com código do país, sem símbolos)</label>
                      <input
                        type="text"
                        value={whatsappForm.phoneNumber}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full md:w-1/2 px-3 py-2 bg-stone-50 border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        placeholder="Ex: 5551999999999"
                      />
                      <p className="text-[10px] text-stone-400 font-sans">
                        Insira o número completo com DDI (Ex: 55 para o Brasil) e DDD. Apenas números.
                      </p>
                    </div>

                    {/* Message PT Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block">Mensagem Padrão para WhatsApp (Português)</label>
                      <textarea
                        rows={3}
                        value={whatsappForm.messagePt}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, messagePt: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        placeholder="Ex: Olá! Gostaria de solicitar um orçamento para o meu evento."
                      />
                    </div>

                    {/* Message ES Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block">Mensagem Padrão para WhatsApp (Espanhol)</label>
                      <textarea
                        rows={3}
                        value={whatsappForm.messageEs}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, messageEs: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-[#F0EFEA] rounded text-sm focus:outline-none focus:border-[#C9A96E]"
                        placeholder="Ex: ¡Hola! Me gustaría solicitar un presupuesto para mi evento."
                      />
                    </div>

                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-[#141414] hover:bg-[#C9A96E] text-white px-5 py-2.5 rounded font-sans text-xs tracking-wider uppercase font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{currentLang === 'pt' ? 'Salvar Configurações' : 'Guardar Configuraciones'}</span>
                    </button>
                    {saveSuccess && (
                      <span className="text-xs text-green-600 font-mono animate-fade-in">
                        ✓ {currentLang === 'pt' ? 'Configurações atualizadas no Firebase!' : '¡Configuraciones actualizadas en Firebase!'}
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
