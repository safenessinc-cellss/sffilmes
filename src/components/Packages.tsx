import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PackagesProps {
  currentLang: 'pt' | 'es';
  onSelectPackage: (pkgName: string) => void;
}

export default function Packages({ currentLang, onSelectPackage }: PackagesProps) {
  const { config } = useApp();
  const [activeTab, setActiveTab] = useState<'casamento' | 'quinceanera' | 'infantil'>('casamento');

  // Map category to localized labels
  const categories = {
    casamento: { pt: 'Casamentos', es: 'Bodas' },
    quinceanera: { pt: '15 Anos', es: 'Quinceañeras' },
    infantil: { pt: 'Festas Infantis', es: 'Fiestas Infantiles' }
  };

  const currentPackages = config.packages[activeTab] || [];

  return (
    <section id="packages" className="py-24 bg-[#FDFCFB] px-6 sm:px-10 lg:px-16 border-t border-[#F0EFEA] select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] block mb-2">
            ST FILMES // COBERTURA & FORMATOS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#141414] font-normal tracking-tight">
            {currentLang === 'pt' ? 'Planos & Cobertura' : 'Planes y Cobertura'}
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-stone-500 font-sans leading-relaxed tracking-wide font-light">
            {currentLang === 'pt'
              ? 'Oferecemos soluções sob medida de alta costura audiovisual para eternizar seus maiores momentos de afeto e celebração.'
              : 'Ofrecemos soluciones a medida de alta costura audiovisual para eternizar sus momentos más grandes de afecto y celebración.'}
          </p>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex justify-center mb-16 border-b border-[#F0EFEA] max-w-md mx-auto">
          {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 text-center pb-4 text-xs tracking-[0.2em] uppercase font-mono transition-all duration-300 relative ${
                activeTab === key ? 'text-[#C9A96E] font-semibold' : 'text-stone-400 hover:text-[#141414]'
              }`}
            >
              {categories[key][currentLang]}
              {activeTab === key && (
                <motion.div
                  layoutId="activeCategoryUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C9A96E]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <AnimatePresence mode="popLayout">
            {currentPackages.map((pkg, idx) => {
              const isBestSeller = idx === 1; // Highlight the middle Package
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`relative flex flex-col justify-between bg-[#FDFCFB] border p-8 sm:p-10 transition-all duration-500 hover:shadow-lg ${
                    isBestSeller 
                      ? 'border-[#C9A96E] shadow-xs' 
                      : 'border-[#F0EFEA]'
                  }`}
                >
                  {/* Highlight Ribbon */}
                  {isBestSeller && (
                    <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-[#C9A96E] text-white font-mono text-[8px] tracking-[0.2em] uppercase px-3 py-1 rounded-sm shadow-xs flex items-center space-x-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>{currentLang === 'pt' ? 'MAIS PROCURADO' : 'MÁS SOLICITADO'}</span>
                    </div>
                  )}

                  {/* Top Details */}
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-[9px] tracking-[0.2em] text-[#C9A96E] uppercase block mb-1">
                        {currentLang === 'pt' ? `OPÇÃO ${idx + 1}` : `OPCIÓN ${idx + 1}`}
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl text-[#141414] font-normal tracking-tight">
                        {currentLang === 'pt' ? pkg.namePt : pkg.nameEs}
                      </h3>
                      <p className="mt-3 text-xs text-stone-500 font-sans leading-relaxed tracking-wide font-light">
                        {currentLang === 'pt' ? pkg.descriptionPt : pkg.descriptionEs}
                      </p>
                    </div>

                    {/* Price display if enabled by admin (hidden by default) */}
                    {pkg.showPrice && pkg.price && (
                      <div className="border-t border-b border-[#F0EFEA] py-3 flex items-baseline space-x-2">
                        <span className="text-xs text-stone-400 font-mono">R$</span>
                        <span className="text-2xl font-serif text-[#C9A96E] font-medium">{pkg.price}</span>
                        <span className="text-[10px] text-stone-400 font-sans">/ {currentLang === 'pt' ? 'cobertura' : 'cobertura'}</span>
                      </div>
                    )}

                    {/* Features List */}
                    <ul className="space-y-4 pt-4 border-t border-[#F0EFEA] text-xs font-sans text-stone-600">
                      {(currentLang === 'pt' ? pkg.featuresPt : pkg.featuresEs).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start space-x-3 leading-relaxed">
                          <Check className="h-4 w-4 text-[#C9A96E] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-10">
                    <button
                      onClick={() => onSelectPackage(currentLang === 'pt' ? pkg.namePt : pkg.nameEs)}
                      className={`w-full py-4 text-xs tracking-[0.25em] uppercase font-sans font-semibold transition-all duration-300 flex items-center justify-center space-x-2 border cursor-pointer ${
                        isBestSeller
                          ? 'bg-[#141414] hover:bg-[#C9A96E] text-white border-[#141414] hover:border-[#C9A96E]'
                          : 'bg-transparent hover:bg-[#141414] text-[#141414] hover:text-white border-[#141414]'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{currentLang === 'pt' ? 'SOLICITAR PROPOSTA' : 'SOLICITAR PROPUESTA'}</span>
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footnote note matching PDF exactly */}
        <p className="mt-12 text-center text-[10px] font-mono uppercase tracking-wider text-stone-400 max-w-xl mx-auto leading-relaxed">
          {currentLang === 'pt'
            ? '* Observação: Os ensaios fotográficos complementares contratados separadamente mantêm nossa curadoria e direção cinematográfica exclusiva.'
            : '* Nota: Los ensayos fotográficos complementarios contratados por separado mantienen nuestra curaduría y dirección cinematográfica exclusiva.'}
        </p>

      </div>
    </section>
  );
}
