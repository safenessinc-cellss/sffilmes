import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Phone } from 'lucide-react';
import { Language, Translation } from '../types';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

interface HeroProps {
  currentLang: Language;
  translations: Translation;
  onExplore: () => void;
}

export default function Hero({ currentLang, translations, onExplore }: HeroProps) {
  const { config } = useApp();
  const { hero } = config;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center bg-[#FDFCFB] px-6 text-center select-none overflow-hidden"
    >
      {/* Background Image Wrapper if customized */}
      {hero.imageUrl && (
        <div className="absolute inset-0 z-0 opacity-15 transition-opacity duration-1000">
          <img 
            src={hero.imageUrl} 
            alt="ST Filmes Cover Background" 
            className="w-full h-full object-cover filter grayscale scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-[#FDFCFB]" />
        </div>
      )}

      {/* Decorative off-center subtle elements like a high-end magazine background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-radial from-[#C9A96E]/5 to-transparent pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-radial from-[#141414]/3 to-transparent pointer-events-none rounded-full blur-3xl" />

      {/* Frame boundary lines to mimic premium museum catalogs */}
      <div className="absolute inset-10 border border-[#F0EFEA] pointer-events-none hidden md:block" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Animated ST FILMES emblem/logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <Logo size="xl" variant="dark" />
        </motion.div>

        {/* Large elegance headline (frase de impacto) with Artistic Flair font treatments */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-4xl sm:text-5xl md:text-7xl font-normal text-[#141414] tracking-tight leading-[1.1] max-w-3xl"
        >
          {currentLang === 'pt' ? (
            <>
              {hero.titlePt} <span className="serif-title text-[#C9A96E]">{hero.titleHighlightPt}</span>
            </>
          ) : (
            <>
              {hero.titleEs} <span className="serif-title text-[#C9A96E]">{hero.titleHighlightEs}</span>
            </>
          )}
        </motion.h1>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1, ease: 'easeInOut' }}
          className="mt-6 font-sans text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#C9A96E] font-medium max-w-2xl px-4"
        >
          {currentLang === 'pt' ? hero.subPt : hero.subEs}
        </motion.p>

        {/* Decorative thin gold divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          transition={{ duration: 1, delay: 1.2 }}
          className="h-[1px] bg-[#C9A96E] mt-8"
        />

        {/* Elegant Phone Number Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease: 'easeOut' }}
          className="mt-6 flex justify-center"
        >
          <a
            href="https://wa.me/5551981323388"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center space-x-2.5 px-6 py-2.5 bg-[#141414] hover:bg-[#C9A96E] text-[#C9A96E] hover:text-white rounded-full font-mono text-xs sm:text-sm tracking-[0.15em] font-semibold transition-all duration-300 shadow-md border border-[#C9A96E]/20 hover:scale-[1.03]"
          >
            <Phone className="h-3.5 w-3.5 text-[#C9A96E] group-hover:text-white animate-pulse" />
            <span>+55 (51) 98132-3388</span>
          </a>
        </motion.div>

        {/* Coverage Cities Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          className="mt-6 flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5 max-w-2xl px-6 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#888888]"
        >
          <span>Porto Alegre</span>
          <span className="text-[#C9A96E]">•</span>
          <span>Canoas</span>
          <span className="text-[#C9A96E]">•</span>
          <span>Novo Hamburgo</span>
          <span className="text-[#C9A96E]">•</span>
          <span>Gravataí</span>
          <span className="text-[#C9A96E]">•</span>
          <span>Gramado</span>
          <span className="text-[#C9A96E]">•</span>
          <span>Bento Gonçalves</span>
          <span className="text-[#C9A96E] hidden sm:inline">•</span>
          <span className="text-[#C9A96E] block w-full sm:inline sm:w-auto mt-1 sm:mt-0 font-semibold">
            {currentLang === 'pt' ? 'SERRA GAÚCHA & METROPOLITANA' : 'SERRA GAÚCHA Y METROPOLITANA'}
          </span>
        </motion.div>
      </div>

      {/* Magazine pagination stamp at bottom left / right */}
      <div className="absolute bottom-12 left-12 font-mono text-[9px] tracking-[0.2em] uppercase text-[#888888] hidden lg:block">
        ST FILMES &copy; {new Date().getFullYear()}
      </div>
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 font-mono text-[9px] tracking-[0.22em] uppercase text-[#888888] hover:text-[#C9A96E] transition-colors duration-300 hidden lg:block">
        <a href="tel:5551981323388" className="hover:underline">TEL: (51) 98132-3388</a>
      </div>
      <div className="absolute bottom-12 right-12 font-mono text-[9px] tracking-[0.2em] uppercase text-[#888888] hidden lg:block">
        {currentLang === 'pt' ? 'PORTO ALEGRE & SERRA GAÚCHA' : 'PORTO ALEGRE Y SERRA GAÚCHA'}
      </div>

      {/* Floating scroll down button */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        onClick={onExplore}
        className="absolute bottom-8 flex flex-col items-center cursor-pointer group"
        aria-label="Scroll down to Works"
      >
        <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#888888] group-hover:text-[#C9A96E] transition-colors duration-300">
          {currentLang === 'pt' ? 'Explorar' : 'Explorar'}
        </span>
        <ChevronDown className="h-4 w-4 mt-2 text-[#C9A96E] group-hover:text-[#141414] transition-colors duration-300" />
      </motion.button>
    </section>
  );
}
