import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface PromotionsProps {
  currentLang: 'pt' | 'es';
}

export default function Promotions({ currentLang }: PromotionsProps) {
  const { config } = useApp();
  const { promotions } = config;

  if (!promotions.active) return null;

  return (
    <div className="bg-[#FDFCFB] px-6 sm:px-10 lg:px-16 pt-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative bg-[#C9A96E]/5 border border-[#C9A96E]/30 p-8 sm:p-10 flex flex-col md:flex-row items-center md:justify-between gap-6 overflow-hidden"
        >
          {/* Subtle gold shine effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#C9A96E]/10 to-transparent pointer-events-none rounded-full blur-xl" />

          <div className="space-y-3 max-w-3xl text-center md:text-left">
            <span className="inline-flex items-center space-x-1.5 bg-[#C9A96E]/10 text-[#C9A96E] font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1 border border-[#C9A96E]/20">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              <span>{currentLang === 'pt' ? promotions.badgePt : promotions.badgeEs}</span>
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#141414]">
              {currentLang === 'pt' ? promotions.titlePt : promotions.titleEs}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed tracking-wide font-light">
              {currentLang === 'pt' ? promotions.descriptionPt : promotions.descriptionEs}
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="#contact"
              className="inline-block bg-[#141414] hover:bg-[#C9A96E] text-white font-sans text-xs tracking-[0.25em] uppercase px-6 py-4 font-semibold transition-colors duration-300 shadow-xs"
            >
              {currentLang === 'pt' ? 'Garantir Oferta' : 'Asegurar Oferta'}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
