import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Save, 
  Copy, 
  Trash2, 
  History, 
  Calculator, 
  DollarSign, 
  Check, 
  FileText, 
  Mail, 
  User, 
  Clock, 
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { PricingConfig, AIBudget, SavedBudget, Language } from '../types';
import { 
  saveBudgetToFirestore, 
  deleteBudgetFromFirestore, 
  listenToBudgets,
  subscribeToAuthError
} from '../lib/firestoreService';

interface AIBudgetGeneratorProps {
  currentLang: Language;
}

const DEFAULT_PRICING: PricingConfig = {
  baseWedding: 1500,
  baseQuinceanera: 1200,
  baseKids: 800,
  baseCinematic: 1000,
  hourlyRate: 150,
  extraStaffFee: 300,
  droneFee: 400,
  albumFee: 250,
  cinematicVideoUpgrade: 500
};

export default function AIBudgetGenerator({ currentLang }: AIBudgetGeneratorProps) {
  // Navigation sub-tabs inside budget generator
  const [activeSubView, setActiveSubView] = useState<'generator' | 'history'>('generator');
  
  // Settings & forms
  const [pricing, setPricing] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('st_filmes_pricing_config');
    return saved ? JSON.parse(saved) : DEFAULT_PRICING;
  });
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNeeds, setClientNeeds] = useState('');
  const [generationLang, setGenerationLang] = useState<'pt' | 'es'>(currentLang);
  
  // Generation & saving states
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [generatedBudget, setGeneratedBudget] = useState<AIBudget | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  
  // Error handling
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  useEffect(() => {
    return subscribeToAuthError((err) => {
      setAuthError(err);
    });
  }, []);
  
  // History & saved proposals
  const [savedProposals, setSavedProposals] = useState<SavedBudget[]>([]);
  const [selectedHistoricalBudget, setSelectedHistoricalBudget] = useState<SavedBudget | null>(null);
  
  // UI helpers
  const [copiedText, setCopiedText] = useState(false);

  // Sync pricing settings to localStorage
  useEffect(() => {
    localStorage.setItem('st_filmes_pricing_config', JSON.stringify(pricing));
  }, [pricing]);

  // Read budgets real-time from Firestore on mount
  useEffect(() => {
    const unsubscribe = listenToBudgets(
      (budgets) => {
        setSavedProposals(budgets);
      },
      (error) => {
        console.error("Failed to subscribe to budgets:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Micro loading-step animations for delightful user feedback
  useEffect(() => {
    if (!isGenerating) return;
    
    const steps = generationLang === 'pt' ? [
      "Lendo suas configurações de preços da ST Filmes...",
      "Analisando os requisitos do evento e convidados...",
      "Identificando adicionais recomendados (drone, assistentes, etc)...",
      "Calculando escopo de horas de cobertura...",
      "Invocando o Gemini 3.5 Flash para validação lógica...",
      "Redigindo proposta de luxo e e-mail comercial personalizado..."
    ] : [
      "Leyendo sus configuraciones de precios de ST Filmes...",
      "Analizando los requisitos del evento e invitados...",
      "Identificando adicionales recomendados (drones, asistentes, etc)...",
      "Calculando alcance de horas de cobertura...",
      "Invocando Gemini 3.5 Flash para validación lógica...",
      "Redactando propuesta de lujo y e-mail comercial personalizado..."
    ];

    let currentStep = 0;
    setCurrentStepText(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setCurrentStepText(steps[currentStep]);
      }
    }, 2200);

    return () => clearInterval(interval);
  }, [isGenerating, generationLang]);

  // Core generation function
  const handleGenerateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientNeeds.trim()) {
      setErrorMsg(generationLang === 'pt' 
        ? "Por favor, preencha o Nome do Cliente e as Necessidades do Momento." 
        : "Por favor, complete el Nombre del Cliente y las Necesidades del Momento.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedBudget(null);
    setIsSaved(false);
    setCurrentSavedId(null);

    try {
      const response = await fetch('/api/generate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricing,
          clientNeeds,
          lang: generationLang
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || "Failed to generate budget");
      }

      const data: AIBudget = await response.json();
      setGeneratedBudget(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unknown error generating budget");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save proposal to Firestore
  const handleSaveProposal = async () => {
    if (!generatedBudget) return;
    try {
      const budgetId = `budget-${Date.now()}`;
      const newSaved: SavedBudget = {
        id: budgetId,
        clientName,
        clientEmail: clientEmail || undefined,
        clientNeeds,
        pricingConfig: pricing,
        generatedAt: new Date().toISOString(),
        budget: generatedBudget
      };

      await saveBudgetToFirestore(newSaved);
      setIsSaved(true);
      setCurrentSavedId(budgetId);
    } catch (err) {
      console.error("Error saving budget proposal:", err);
      alert("Error saving budget proposal to Firestore.");
    }
  };

  // Delete saved proposal from Firestore
  const handleDeleteProposal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = generationLang === 'pt' 
      ? "Tem certeza que deseja excluir este orçamento permanentemente?" 
      : "¿Está seguro de que desea eliminar este presupuesto permanentemente?";
      
    if (window.confirm(confirmMsg)) {
      try {
        await deleteBudgetFromFirestore(id);
        if (selectedHistoricalBudget?.id === id) {
          setSelectedHistoricalBudget(null);
        }
        if (currentSavedId === id) {
          setIsSaved(false);
          setCurrentSavedId(null);
        }
      } catch (err) {
        console.error("Error deleting proposal:", err);
        alert("Failed to delete proposal.");
      }
    }
  };

  // Helper: Copy sales pitch to clipboard
  const handleCopySalesPitch = (pitch: string) => {
    navigator.clipboard.writeText(pitch);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getFullPitchText = (pitch: any) => {
    if (!pitch) return '';
    return `Assunto: ${pitch.subject}\n\n${pitch.intro}\n\n${pitch.body}\n\n${pitch.closing}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-4 space-y-3 md:space-y-0">
        <div>
          <h3 className="font-serif italic text-lg text-[#141414]">
            {currentLang === 'pt' ? 'Gerador de Orçamentos IA' : 'Generador de Presupuestos IA'}
          </h3>
          <p className="text-xs text-stone-500">
            {currentLang === 'pt' 
              ? 'Defina sua tabela de preços da ST Filmes e deixe o Gemini calcular pacotes sob demanda.' 
              : 'Defina su tabla de precios de ST Filmes y deje que Gemini calcule paquetes bajo demanda.'}
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex space-x-1.5 bg-stone-100 p-1 rounded-sm text-xs font-mono">
          <button
            onClick={() => { setActiveSubView('generator'); setSelectedHistoricalBudget(null); }}
            className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
              activeSubView === 'generator' && !selectedHistoricalBudget
                ? 'bg-white text-[#C9A96E] font-medium shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="inline-block h-3.5 w-3.5 mr-1.5" />
            {currentLang === 'pt' ? 'Novo Orçamento' : 'Nuevo Presupuesto'}
          </button>
          <button
            onClick={() => setActiveSubView('history')}
            className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center ${
              activeSubView === 'history' || selectedHistoricalBudget
                ? 'bg-white text-[#C9A96E] font-medium shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="inline-block h-3.5 w-3.5 mr-1.5" />
            {currentLang === 'pt' ? 'Histórico' : 'Historial'}
            {savedProposals.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-[#C9A96E] text-white text-[9px] rounded-full font-sans font-bold">
                {savedProposals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {authError && authError.includes('configuration-not-found') && (
        <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-sm space-y-2 text-xs text-[#141414] leading-relaxed shadow-xs">
          <div className="flex items-center space-x-2 font-semibold text-amber-900 font-serif italic">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              {currentLang === 'pt' 
                ? 'Nota sobre Autenticação Firebase' 
                : 'Nota sobre Autenticación Firebase'}
            </span>
          </div>
          <p>
            {currentLang === 'pt'
              ? 'Detectamos que o login anônimo está desativado no console do seu Firebase. Para garantir segurança total, ative o provedor "Anônimo" acessando: Firebase Console ➔ Authentication ➔ Sign-in method ➔ Adicionar novo provedor ➔ Anônimo.'
              : 'Detectamos que el inicio de sesión anónimo está desactivado en la consola de su Firebase. Para asegurar la máxima seguridad, active el proveedor "Anónimo" ingresando a: Firebase Console ➔ Authentication ➔ Sign-in method ➔ Agregar nuevo proveedor ➔ Anónimo.'}
          </p>
          <p className="font-mono text-[10px] text-amber-800 bg-amber-100/50 p-2 rounded-xs">
            ✨ {currentLang === 'pt'
              ? 'Tudo no aplicativo continua 100% funcional! Atualizamos as regras de segurança do Firestore para que você possa salvar, listar e apagar seus orçamentos e portfólios livremente.'
              : '¡Todo en la aplicación sigue 100% funcional! Actualizamos las reglas de seguridad de Firestore para que pueda guardar, listar y eliminar sus presupuestos y portafolios libremente.'}
          </p>
        </div>
      )}

      {/* VIEW 1: MAIN BUDGET CALCULATOR */}
      {activeSubView === 'generator' && !selectedHistoricalBudget && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column - Input Configuration */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* 1. Base Prices Settings card */}
            <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4 text-[#C9A96E]" />
                  <h4 className="font-serif italic text-sm text-[#141414]">
                    {currentLang === 'pt' ? 'Tabela de Preços Ativos' : 'Tabla de Precios Activos'}
                  </h4>
                </div>
                <button
                  onClick={() => { if (window.confirm(currentLang === 'pt' ? "Redefinir tabela para valores padrão?" : "¿Restablecer precios por defecto?")) setPricing(DEFAULT_PRICING); }}
                  className="text-[10px] font-mono text-[#C9A96E] hover:underline flex items-center"
                >
                  <RefreshCw className="h-2.5 w-2.5 mr-1" />
                  {currentLang === 'pt' ? 'Padrão' : 'Defectos'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Wedding */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Casamento Base ($)' : 'Boda Base ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.baseWedding}
                    onChange={(e) => setPricing({ ...pricing, baseWedding: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Quinceanera */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? '15 Anos Base ($)' : '15 Años Base ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.baseQuinceanera}
                    onChange={(e) => setPricing({ ...pricing, baseQuinceanera: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Kids */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Festa Infantil ($)' : 'Festa Infantil ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.baseKids}
                    onChange={(e) => setPricing({ ...pricing, baseKids: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Video Base */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Video/Cinema Base ($)' : 'Video/Cine Base ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.baseCinematic}
                    onChange={(e) => setPricing({ ...pricing, baseCinematic: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Additional Hour */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Hora Extra ($)' : 'Hora Adicional ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.hourlyRate}
                    onChange={(e) => setPricing({ ...pricing, hourlyRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Extra Staff */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Staff Adicional ($)' : 'Staff Adicional ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.extraStaffFee}
                    onChange={(e) => setPricing({ ...pricing, extraStaffFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Drone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Adicional Drone ($)' : 'Adicional Drone ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.droneFee}
                    onChange={(e) => setPricing({ ...pricing, droneFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Album */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Álbum Físico ($)' : 'Álbum Físico ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.albumFee}
                    onChange={(e) => setPricing({ ...pricing, albumFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>

                {/* Cinematic Upgrade */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    {currentLang === 'pt' ? 'Upgrade Edição Cinema Premium ($)' : 'Upgrade Edición Cine Premium ($)'}
                  </label>
                  <input
                    type="number"
                    value={pricing.cinematicVideoUpgrade}
                    onChange={(e) => setPricing({ ...pricing, cinematicVideoUpgrade: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Client and prompt settings card */}
            <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h4 className="font-serif italic text-sm text-[#141414]">
                  {currentLang === 'pt' ? 'Dados do Cliente & Escopo' : 'Datos de Cliente & Alcance'}
                </h4>
              </div>

              <form onSubmit={handleGenerateBudget} className="space-y-4 text-xs">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">
                    {currentLang === 'pt' ? 'Nome do Cliente / Casal' : 'Nombre del Cliente / Pareja'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={currentLang === 'pt' ? 'Ex: Juliana e Roberto' : 'Ej: Juliana y Roberto'}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </div>

                {/* Client Email */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">
                    {currentLang === 'pt' ? 'E-mail do Cliente (Opcional)' : 'Email del Cliente (Opcional)'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="juliana@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </div>

                {/* Select generation language */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">
                    {currentLang === 'pt' ? 'Idioma do Orçamento Gerado' : 'Idioma del Presupuesto Generado'}
                  </label>
                  <div className="flex space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={generationLang === 'pt'}
                        onChange={() => setGenerationLang('pt')}
                        className="accent-[#C9A96E]"
                      />
                      <span>Português (PT)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={generationLang === 'es'}
                        onChange={() => setGenerationLang('es')}
                        className="accent-[#C9A96E]"
                      />
                      <span>Español (ES)</span>
                    </label>
                  </div>
                </div>

                {/* Moment Needs Prompt Input */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-stone-500 block">
                    {currentLang === 'pt' 
                      ? 'Descreva as Necessidades e Detalhes do Evento' 
                      : 'Describa las Necesidades y Detalles del Evento'} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={clientNeeds}
                    onChange={(e) => setClientNeeds(e.target.value)}
                    placeholder={currentLang === 'pt' 
                      ? 'Descreva o evento. Ex: Casamento para 250 pessoas, cobertura de 9 horas, com cerimônia no campo à tarde. Gostaríamos de drone, 2 fotógrafos, e álbum impresso de luxo. Querem vídeo no estilo cinema.' 
                      : 'Describa el evento. Ej: Boda para 250 personas, cobertura de 9 horas, ceremonia de campo por la tarde. Quieren drone, 2 fotógrafos, álbum de lujo y video estilo cine.'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:border-[#C9A96E] leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setClientNeeds(currentLang === 'pt' 
                        ? "Casamento rústico ao ar livre à tarde, 8 horas de duração, 150 convidados. Querem vídeo editado estilo cinema, cobertura aérea com drone, e álbum de fotos grande de alta costura."
                        : "Boda rústica al aire libre por la tarde, 8 horas de duración, 150 invitados. Quieren video editado estilo cine, drone, y álbum de fotos grande de alta costura."
                      )}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded text-[10px] transition-colors"
                    >
                      💡 {currentLang === 'pt' ? 'Exemplo Casamento rústico' : 'Ejemplo Boda Rústica'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientNeeds(currentLang === 'pt'
                        ? "Festa de 15 anos em salão fechado de gala, 6 horas de cobertura, 300 convidados. Querem apenas fotos de alta qualidade, 2 fotógrafos (um focado na pista de dança) e álbum de fotos."
                        : "Fiesta de 15 años en salón cerrado de gala, 6 horas de cobertura, 300 invitados. Quieren solo fotos de alta calidad, 2 fotógrafos y álbum."
                      )}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded text-[10px] transition-colors"
                    >
                      💡 {currentLang === 'pt' ? 'Exemplo 15 Anos' : 'Ejemplo 15 Años'}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded border border-red-100 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-[#141414] hover:bg-[#C9A96E] disabled:bg-stone-300 text-white font-sans text-xs tracking-[0.2em] uppercase py-3 font-semibold transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#C9A96E]" />
                      <span>{currentLang === 'pt' ? 'Calculando com IA...' : 'Calculando con IA...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-[#C9A96E]" />
                      <span>{currentLang === 'pt' ? 'Gerar Orçamento Lógico' : 'Generar Presupuesto Lógico'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Results Pane */}
          <div className="xl:col-span-7 h-full">
            
            {/* If generating: show premium beautiful skeleton */}
            {isGenerating && (
              <div className="bg-white border border-stone-200/80 p-8 rounded-sm shadow-xs h-[550px] flex flex-col justify-center items-center text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full h-16 w-16 bg-[#C9A96E]/5 animate-ping" />
                  <div className="rounded-full h-12 w-12 bg-stone-900 flex items-center justify-center border border-[#C9A96E]/30">
                    <Sparkles className="h-5 w-5 text-[#C9A96E] animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-serif italic text-base text-[#141414]">
                    {currentLang === 'pt' ? 'Construindo proposta comercial...' : 'Construyendo propuesta comercial...'}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-mono italic animate-pulse">
                    {currentStepText}
                  </p>
                </div>

                <div className="w-48 bg-stone-100 h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-[#C9A96E] h-1 animate-[shimmer_2s_infinite] w-full" />
                </div>
              </div>
            )}

            {/* If empty and not generating: show idle instructions card */}
            {!isGenerating && !generatedBudget && (
              <div className="bg-[#FDFCFB] border border-stone-200/50 p-12 rounded-sm text-center h-[550px] flex flex-col justify-center items-center space-y-4 border-dashed">
                <div className="rounded-full h-12 w-12 bg-stone-50 flex items-center justify-center border border-[#C9A96E]/10">
                  <Calculator className="h-5 w-5 text-stone-400" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-serif italic text-base text-stone-700">
                    {currentLang === 'pt' ? 'Aguardando parâmetros do evento' : 'Esperando parámetros del evento'}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {currentLang === 'pt'
                      ? 'Preencha o formulário ao lado com as necessidades reais do cliente. Nossa inteligência artificial aplicará as regras de precificação configuradas e gerará um orçamento lógico detalhado e coerente.'
                      : 'Complete el formulario al lado con las necesidades reales del cliente. Nuestra inteligencia artificial aplicará las reglas de tarifas configuradas y generará una cotización lógica detallada y coherente.'}
                  </p>
                </div>
              </div>
            )}

            {/* If budget generated: show beautiful custom proposal card */}
            {!isGenerating && generatedBudget && (
              <div className="bg-white border border-[#C9A96E]/30 rounded-sm shadow-md overflow-hidden flex flex-col">
                
                {/* Header proposal meta */}
                <div className="bg-stone-900 px-6 py-4 flex justify-between items-center text-white">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-[#C9A96E] uppercase block">
                      ST FILMES &mdash; ORÇAMENTO IA INTELIGENTE
                    </span>
                    <h4 className="font-serif italic text-base text-[#FDFCFB] mt-0.5">
                      Proposta de {clientName}
                    </h4>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isSaved ? (
                      <span className="bg-green-600/20 text-green-400 text-[10px] font-mono px-2.5 py-1 rounded flex items-center space-x-1 border border-green-500/20">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        <span>{currentLang === 'pt' ? 'Salvo' : 'Guardado'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleSaveProposal}
                        className="bg-[#C9A96E] hover:bg-white hover:text-stone-950 text-stone-950 text-[10px] font-mono font-bold px-3 py-1 rounded-sm transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        <span>{currentLang === 'pt' ? 'Salvar Proposta' : 'Guardar Propuesta'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Main scrollable body of proposal */}
                <div className="p-6 space-y-6 max-h-[580px] overflow-y-auto">
                  
                  {/* Analysis Summary */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                      {currentLang === 'pt' ? 'Análise do Escopo' : 'Análisis del Alcance'}
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50 p-3 border-l-2 border-[#C9A96E] rounded-r-xs">
                      "{generatedBudget.summary}"
                    </p>
                  </div>

                  {/* Line items Table */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                      {currentLang === 'pt' ? 'Breakdown de Itens e Preços' : 'Breakdown de Items y Precios'}
                    </span>
                    <div className="border border-stone-100 rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-stone-50 text-stone-500 font-mono text-[9px] uppercase tracking-wider border-b border-stone-100">
                            <th className="px-4 py-2.5">{currentLang === 'pt' ? 'Item' : 'Item'}</th>
                            <th className="px-3 py-2.5 text-center">{currentLang === 'pt' ? 'Qtd / Hrs' : 'Cant / Hrs'}</th>
                            <th className="px-3 py-2.5 text-right">{currentLang === 'pt' ? 'Unitário' : 'Unitario'}</th>
                            <th className="px-4 py-2.5 text-right">{currentLang === 'pt' ? 'Total' : 'Total'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {generatedBudget.lineItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-stone-800">{item.name}</div>
                                <div className="text-[10px] text-stone-400 mt-0.5">{item.justification}</div>
                              </td>
                              <td className="px-3 py-3 text-center font-mono font-medium text-stone-600">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-stone-500">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-semibold text-stone-800">
                                {formatCurrency(item.totalPrice)}
                              </td>
                            </tr>
                          ))}
                          
                          {/* Grand Total */}
                          <tr className="bg-stone-50/50 font-serif">
                            <td colSpan={3} className="px-4 py-4 text-right text-stone-500 italic font-medium">
                              {currentLang === 'pt' ? 'Valor Total do Orçamento:' : 'Valor Total del Presupuesto:'}
                            </td>
                            <td className="px-4 py-4 text-right text-base text-[#141414] font-bold font-mono tracking-tight border-t-2 border-stone-200">
                              {formatCurrency(generatedBudget.totalPrice)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                      {currentLang === 'pt' ? 'Recomendações e Dicas de IA' : 'Recomendaciones y Consejos de IA'}
                    </span>
                    <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-5">
                      {generatedBudget.recommendations.map((rec, i) => (
                        <li key={i} className="leading-relaxed">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sales Pitch / Copy Section */}
                  <div className="space-y-2 border-t border-stone-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                        {currentLang === 'pt' ? 'Modelo de Proposta Pronta para Envio' : 'Modelo de Propuesta Lista para Envío'}
                      </span>
                      <button
                        onClick={() => handleCopySalesPitch(getFullPitchText(generatedBudget.salesPitch))}
                        className="text-[10px] font-mono flex items-center space-x-1 text-[#C9A96E] hover:underline cursor-pointer"
                      >
                        {copiedText ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">{currentLang === 'pt' ? 'Copiado!' : '¡Copiado!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{currentLang === 'pt' ? 'Copiar Texto' : 'Copiar Texto'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-stone-50 p-4 border border-stone-200/50 rounded-sm text-xs font-sans space-y-3 leading-relaxed text-stone-700 shadow-inner select-all">
                      <div className="border-b border-stone-200/50 pb-2 mb-2 font-mono text-[10px]">
                        <strong>{currentLang === 'pt' ? 'Assunto:' : 'Asunto:'}</strong> {generatedBudget.salesPitch.subject}
                      </div>
                      <p>{generatedBudget.salesPitch.intro}</p>
                      <p className="whitespace-pre-line">{generatedBudget.salesPitch.body}</p>
                      <p>{generatedBudget.salesPitch.closing}</p>
                    </div>
                  </div>

                </div>

                {/* Footer copy tip */}
                <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono text-center">
                  ✨ {currentLang === 'pt' 
                    ? 'Use o botão copiar acima para enviar este orçamento no WhatsApp ou E-mail.' 
                    : 'Use el botón copiar arriba para enviar este presupuesto en WhatsApp o E-mail.'}
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 2: HISTORY LIST */}
      {(activeSubView === 'history' || selectedHistoricalBudget) && (
        <div className="space-y-6">
          
          {/* Back to list if viewing a specific historical item */}
          {selectedHistoricalBudget && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedHistoricalBudget(null)}
                className="text-xs font-mono text-[#C9A96E] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                &larr; {currentLang === 'pt' ? 'Voltar ao histórico' : 'Volver al historial'}
              </button>
            </div>
          )}

          {/* If viewing specific saved budget */}
          {selectedHistoricalBudget ? (
            <div className="bg-white border border-[#C9A96E]/20 rounded-sm shadow-md overflow-hidden">
              <div className="bg-stone-950 px-6 py-4 flex justify-between items-center text-white">
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#C9A96E] uppercase block">
                    {currentLang === 'pt' ? 'HISTÓRICO DE ORÇAMENTOS' : 'HISTORIAL DE PRESUPUESTOS'}
                  </span>
                  <h4 className="font-serif italic text-base text-stone-100">
                    {selectedHistoricalBudget.clientName} &mdash; {new Date(selectedHistoricalBudget.generatedAt).toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : 'es-ES')}
                  </h4>
                </div>
                <button
                  onClick={(e) => { 
                    handleDeleteProposal(selectedHistoricalBudget.id, e);
                  }}
                  className="bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-900/20 p-2 rounded transition-colors cursor-pointer"
                  title="Excluir este orçamento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Duplicate of beautiful view logic */}
              <div className="p-6 space-y-6">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-stone-100 pb-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                      {currentLang === 'pt' ? 'Necessidades Originais descritas:' : 'Necesidades Originales descritas:'}
                    </span>
                    <p className="text-stone-600 italic bg-stone-50 p-2.5 rounded mt-1 border-l border-stone-300">
                      "{selectedHistoricalBudget.clientNeeds}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                      {currentLang === 'pt' ? 'E-mail:' : 'E-mail:'}
                    </span>
                    <p className="text-stone-800 font-medium">
                      {selectedHistoricalBudget.clientEmail || (currentLang === 'pt' ? 'Não informado' : 'No informado')}
                    </p>
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mt-2">
                      {currentLang === 'pt' ? 'Gerado em:' : 'Generado en:'}
                    </span>
                    <p className="text-stone-800">
                      {new Date(selectedHistoricalBudget.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                    {currentLang === 'pt' ? 'Análise do Escopo' : 'Análisis del Alcance'}
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50 p-3 border-l-2 border-[#C9A96E] rounded-r-xs">
                    "{selectedHistoricalBudget.budget.summary}"
                  </p>
                </div>

                {/* Line items Table */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                    {currentLang === 'pt' ? 'Breakdown de Itens e Preços' : 'Breakdown de Items y Precios'}
                  </span>
                  <div className="border border-stone-100 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-stone-50 text-stone-500 font-mono text-[9px] uppercase tracking-wider border-b border-stone-100">
                          <th className="px-4 py-2.5">{currentLang === 'pt' ? 'Item' : 'Item'}</th>
                          <th className="px-3 py-2.5 text-center">{currentLang === 'pt' ? 'Qtd / Hrs' : 'Cant / Hrs'}</th>
                          <th className="px-3 py-2.5 text-right">{currentLang === 'pt' ? 'Unitário' : 'Unitario'}</th>
                          <th className="px-4 py-2.5 text-right">{currentLang === 'pt' ? 'Total' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {selectedHistoricalBudget.budget.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50/50">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-stone-800">{item.name}</div>
                              <div className="text-[10px] text-stone-400 mt-0.5">{item.justification}</div>
                            </td>
                            <td className="px-3 py-3 text-center font-mono font-medium text-stone-600">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-stone-500">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-stone-800">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Grand Total */}
                        <tr className="bg-stone-50/50 font-serif">
                          <td colSpan={3} className="px-4 py-4 text-right text-stone-500 italic font-medium">
                            {currentLang === 'pt' ? 'Valor Total do Orçamento:' : 'Valor Total del Presupuesto:'}
                          </td>
                          <td className="px-4 py-4 text-right text-base text-[#141414] font-bold font-mono tracking-tight border-t-2 border-stone-200">
                            {formatCurrency(selectedHistoricalBudget.budget.totalPrice)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                    {currentLang === 'pt' ? 'Recomendações e Dicas de IA' : 'Recomendaciones y Consejos de IA'}
                  </span>
                  <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-5">
                    {selectedHistoricalBudget.budget.recommendations.map((rec, i) => (
                      <li key={i} className="leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sales Pitch Copy */}
                <div className="space-y-2 border-t border-stone-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono tracking-wider text-[#C9A96E] uppercase block">
                      {currentLang === 'pt' ? 'Modelo de Proposta Pronta' : 'Modelo de Propuesta Lista'}
                    </span>
                    <button
                      onClick={() => handleCopySalesPitch(getFullPitchText(selectedHistoricalBudget.budget.salesPitch))}
                      className="text-[10px] font-mono flex items-center space-x-1 text-[#C9A96E] hover:underline cursor-pointer"
                    >
                      {copiedText ? (
                        <>
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">{currentLang === 'pt' ? 'Copiado!' : '¡Copiado!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{currentLang === 'pt' ? 'Copiar Texto' : 'Copiar Texto'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-stone-50 p-4 border border-stone-200/50 rounded-sm text-xs font-sans space-y-3 leading-relaxed text-stone-700 shadow-inner select-all">
                    <div className="border-b border-stone-200/50 pb-2 mb-2 font-mono text-[10px]">
                      <strong>{currentLang === 'pt' ? 'Assunto:' : 'Asunto:'}</strong> {selectedHistoricalBudget.budget.salesPitch.subject}
                    </div>
                    <p>{selectedHistoricalBudget.budget.salesPitch.intro}</p>
                    <p className="whitespace-pre-line">{selectedHistoricalBudget.budget.salesPitch.body}</p>
                    <p>{selectedHistoricalBudget.budget.salesPitch.closing}</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Historical List Grid */
            <div className="bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden">
              {savedProposals.length === 0 ? (
                <div className="p-16 text-center text-stone-500 space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-stone-300" />
                  <p className="text-sm font-serif italic">
                    {currentLang === 'pt' 
                      ? 'Nenhum orçamento salvo no histórico ainda.' 
                      : 'Ningún presupuesto guardado en el historial aún.'}
                  </p>
                  <button
                    onClick={() => setActiveSubView('generator')}
                    className="text-xs text-[#C9A96E] font-mono hover:underline cursor-pointer"
                  >
                    {currentLang === 'pt' ? 'Gerar seu primeiro orçamento &rarr;' : 'Generar su primer presupuesto &rarr;'}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 text-xs text-stone-600">
                  <div className="bg-stone-50/50 px-6 py-3 font-mono text-[9px] uppercase tracking-wider text-stone-400 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">{currentLang === 'pt' ? 'Cliente' : 'Cliente'}</div>
                    <div className="col-span-3">{currentLang === 'pt' ? 'Tipo de Evento' : 'Tipo de Evento'}</div>
                    <div className="col-span-2 text-right">{currentLang === 'pt' ? 'Valor Total' : 'Valor Total'}</div>
                    <div className="col-span-2">{currentLang === 'pt' ? 'Gerado Em' : 'Generado En'}</div>
                    <div className="col-span-1 text-right">{currentLang === 'pt' ? 'Ações' : 'Acciones'}</div>
                  </div>

                  {savedProposals.map((budgetDoc) => (
                    <div
                      key={budgetDoc.id}
                      onClick={() => setSelectedHistoricalBudget(budgetDoc)}
                      className="px-6 py-4 hover:bg-stone-50/60 transition-colors grid grid-cols-12 gap-4 items-center cursor-pointer border-b border-stone-100/30 last:border-0"
                    >
                      <div className="col-span-4 font-semibold text-stone-900 truncate">
                        {budgetDoc.clientName}
                        {budgetDoc.clientEmail && (
                          <span className="block text-[10px] font-normal text-stone-400 truncate mt-0.5">
                            {budgetDoc.clientEmail}
                          </span>
                        )}
                      </div>
                      
                      <div className="col-span-3 capitalize">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-600 border border-stone-200/50">
                          {budgetDoc.budget.eventType}
                        </span>
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(budgetDoc.budget.totalPrice)}
                      </div>

                      <div className="col-span-2 text-stone-400 text-[10px] font-mono">
                        {new Date(budgetDoc.generatedAt).toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : 'es-ES')}
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          onClick={(e) => handleDeleteProposal(budgetDoc.id, e)}
                          className="text-stone-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                          title="Excluir orçamento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
