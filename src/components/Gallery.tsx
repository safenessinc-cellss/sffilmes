import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, MapPin, Play } from 'lucide-react';
import { Language, Translation, PortfolioItem } from '../types';
import { useApp } from '../context/AppContext';

interface GalleryProps {
  currentLang: Language;
  translations: Translation;
  onOpenLightbox: (index: number) => void;
}

export default function Gallery({
  currentLang,
  translations,
  onOpenLightbox,
}: GalleryProps) {
  const { portfolio } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter items based on selected category key
  const filteredItems = portfolio.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const categoriesList = [
    { key: 'all', label: currentLang === 'pt' ? 'Todos' : 'Todos' },
    { key: 'casamento', label: currentLang === 'pt' ? 'Casamentos' : 'Bodas' },
    { key: '15anos', label: currentLang === 'pt' ? '15 Anos' : '15 Años' },
    { key: 'infantil', label: currentLang === 'pt' ? 'Infantil' : 'Infantil' },
    { key: 'cinematic', label: currentLang === 'pt' ? 'Cinematografia' : 'Cinematografía' },
  ];

  return (
    <section id="works" className="py-24 sm:py-32 bg-[#FDFCFB] px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Title & Headers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#F0EFEA] pb-8">
          <div>
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] block mb-2">
              ST FILMES // COLLECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141414] font-normal tracking-tight">
              {currentLang === 'pt' ? 'Obras Selecionadas' : 'Obras Seleccionadas'}
            </h2>
          </div>
          
          <p className="mt-4 md:mt-0 max-w-sm text-xs text-[#888888] font-sans leading-relaxed tracking-wide">
            {currentLang === 'pt'
              ? 'Uma curadoria rigorosa de capturas que traduzem a nossa assinatura estética: luz dramática, sombras expressivas e narrativa cinematográfica.'
              : 'Una rigurosa curaduría de capturas que traducen nuestra firma estética: luz dramática, sombras expresivas y narrativa cinematográfica.'}
          </p>
        </div>

        {/* Category Filter Menu */}
        <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-3 mb-16 text-xs tracking-[0.2em] uppercase font-sans font-medium">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`relative py-1.5 transition-colors duration-300 hover:text-[#C9A96E] cursor-pointer ${
                  isActive ? 'text-[#C9A96E] font-semibold' : 'text-[#888888]'
                }`}
              >
                {cat.label}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryDot"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#C9A96E]"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Asymmetrical Masonry Grid */}
        <motion.div 
          layout
          className="asymmetric-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              // Find index in original non-filtered array to pass correct index to Lightbox
              const originalIndex = portfolio.findIndex((p) => p.id === item.id);
              const displayIndex = String(originalIndex + 1).padStart(2, '0');
              const categoryLabel = categoriesList.find(c => c.key === item.category)?.label || item.category;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="gallery-item group relative flex flex-col justify-between"
                  id={`photo-card-${item.id}`}
                >
                  {/* Image Container with Hover Overlay & Artistic Placeholder style */}
                  <div 
                    onClick={() => onOpenLightbox(originalIndex)}
                    className="relative overflow-hidden bg-[#EAE8E4] image-placeholder cursor-zoom-in transition-all duration-700 shadow-xs"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                    
                    {/* Hover controls/view indicator */}
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-xs p-2 rounded-full shadow-xs">
                      {item.videoUrl ? (
                        <Play className="h-4 w-4 text-[#C9A96E] fill-current" />
                      ) : (
                        <Maximize2 className="h-4 w-4 text-[#C9A96E]" />
                      )}
                    </div>

                    {/* Media Type Indicator */}
                    {item.videoUrl && (
                      <div className="absolute bottom-4 left-4 z-20 bg-[#141414]/80 backdrop-blur-xs px-2.5 py-1 text-[8px] font-mono tracking-widest text-white uppercase rounded-xs flex items-center space-x-1">
                        <Play className="h-2 w-2 text-white fill-current" />
                        <span>VIDEO</span>
                      </div>
                    )}

                    <img
                      src={item.url}
                      alt={item.title[currentLang]}
                      referrerPolicy="no-referrer"
                      className="w-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-[1.03]"
                      style={{
                        aspectRatio: 
                          item.aspectRatio === 'portrait' ? '3/4' :
                          item.aspectRatio === 'landscape' ? '4/3' :
                          item.aspectRatio === 'wide' ? '16/9' : '1/1',
                      }}
                    />
                  </div>

                  {/* Elegant Editorial Caption Underneath */}
                  <div className="mt-4 pt-1 pb-4 flex flex-col font-sans select-none border-b border-[#F0EFEA]">
                    <div className="flex items-center justify-between text-[10px] tracking-[0.15em] text-[#888888] font-mono mb-1">
                      <span>{displayIndex} &mdash; {categoryLabel}</span>
                      <span>{item.year}</span>
                    </div>
                    
                    <h3 
                      onClick={() => onOpenLightbox(originalIndex)}
                      className="font-serif text-lg text-[#141414] hover:text-[#C9A96E] transition-colors duration-300 font-normal cursor-pointer"
                    >
                      {currentLang === 'pt' ? item.title.pt : item.title.es}
                    </h3>
                    
                    {item.location && (
                      <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-[#C9A96E] tracking-wider font-medium">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    {item.description && (item.description.pt || item.description.es) && (
                      <p className="mt-2 text-xs text-stone-500 font-sans font-light leading-relaxed">
                        {currentLang === 'pt' ? item.description.pt : item.description.es}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        
        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="font-serif text-lg text-[#888888]">
              {currentLang === 'pt' ? 'Nenhuma obra encontrada nesta categoria.' : 'Ninguna obra encontrada en esta categoría.'}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
