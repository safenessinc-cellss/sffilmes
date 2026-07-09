import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, Globe, Lock } from 'lucide-react';
import { Language, Translation } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  translations: Translation;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export default function Header({
  currentLang,
  setLang,
  translations,
  activeSection,
  onNavigate,
  onOpenAdmin,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to add slight shadow / background fill
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'works', label: translations.navWorks },
    { id: 'about', label: translations.navAbout },
    { id: 'contact', label: translations.navContact },
  ];

  const handleItemClick = (id: string) => {
    setIsOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header
        id="app-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#F0EFEA] py-2 shadow-xs'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <button
            onClick={() => handleItemClick('hero')}
            className="group flex items-center space-x-2 transition-transform duration-300 hover:scale-[1.02]"
            aria-label="ST FILMES Home"
          >
            <Logo size="sm" variant="dark" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-12">
            <ul className="flex items-center space-x-10 text-xs tracking-[0.25em] uppercase font-sans font-semibold text-[#141414]">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id} className="relative">
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`relative py-2 transition-colors duration-300 hover:text-[#C9A96E] ${
                        isActive ? 'text-[#C9A96E]' : 'text-[#141414]'
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="navUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C9A96E]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Language Switcher */}
            <div className="flex items-center border-l border-[#F0EFEA] pl-8 space-x-4 text-xs font-sans tracking-[0.1em]">
              <button
                onClick={() => setLang('pt')}
                className={`transition-all duration-300 text-base filter hover:grayscale-0 ${
                  currentLang === 'pt' ? 'scale-110 drop-shadow-xs grayscale-0' : 'grayscale opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                title="Português"
              >
                🇧🇷
              </button>
              <span className="text-[#C9A96E]/30">|</span>
              <button
                onClick={() => setLang('es')}
                className={`transition-all duration-300 text-base filter hover:grayscale-0 ${
                  currentLang === 'es' ? 'scale-110 drop-shadow-xs grayscale-0' : 'grayscale opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                title="Español"
              >
                🇪🇸
              </button>

              {/* Admin Button */}
              <button
                onClick={onOpenAdmin}
                className="ml-4 p-1.5 rounded-full border border-stone-200 text-stone-400 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300"
                title="Acesso Admin / Acceso Administrador"
              >
                <Lock className="h-3 w-3" />
              </button>
            </div>
          </nav>

          {/* Mobile Actions: Language + Burger */}
          <div className="flex items-center space-x-3.5 md:hidden">
            {/* Quick Language Selector with Flags */}
            <div className="flex items-center space-x-2 bg-white/60 px-2 py-1.5 rounded-full border border-[#F0EFEA]">
              <button
                onClick={() => setLang('pt')}
                className={`transition-all duration-300 text-base filter ${
                  currentLang === 'pt' ? 'scale-110 grayscale-0 opacity-100' : 'grayscale opacity-50 scale-95 hover:opacity-90'
                }`}
                title="Português"
              >
                🇧🇷
              </button>
              <span className="text-stone-300 text-[10px] select-none">|</span>
              <button
                onClick={() => setLang('es')}
                className={`transition-all duration-300 text-base filter ${
                  currentLang === 'es' ? 'scale-110 grayscale-0 opacity-100' : 'grayscale opacity-50 scale-95 hover:opacity-90'
                }`}
                title="Español"
              >
                🇪🇸
              </button>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#141414] hover:text-[#C9A96E] p-1 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-35 bg-[#FDFCFB] flex flex-col justify-center px-10 md:hidden"
          >
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 opacity-10">
              <Logo size="xl" variant="dark" />
            </div>

            <nav className="relative z-10">
              <ul className="flex flex-col space-y-8 text-xl tracking-[0.2em] uppercase font-serif text-center">
                {navItems.map((item, index) => (
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={item.id}
                  >
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`block w-full py-2 hover:text-[#C9A96E] transition-colors duration-300 ${
                        activeSection === item.id ? 'text-[#C9A96E]' : 'text-[#111111]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>

              {/* Language Selector in Drawer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-16 flex flex-col items-center space-y-6"
              >
                <div className="flex justify-center items-center space-x-6 text-sm tracking-wider font-sans">
                  <button
                    onClick={() => {
                      setLang('pt');
                      setIsOpen(false);
                    }}
                    className={`py-1 px-3 flex items-center space-x-2.5 transition-all ${
                      currentLang === 'pt'
                        ? 'border-b border-[#C9A96E] text-[#C9A96E] font-medium'
                        : 'text-[#888888] hover:text-[#111111]'
                    }`}
                  >
                    <span>🇧🇷</span>
                    <span>Português</span>
                  </button>
                  <button
                    onClick={() => {
                      setLang('es');
                      setIsOpen(false);
                    }}
                    className={`py-1 px-3 flex items-center space-x-2.5 transition-all ${
                      currentLang === 'es'
                        ? 'border-b border-[#C9A96E] text-[#C9A96E] font-medium'
                        : 'text-[#888888] hover:text-[#111111]'
                    }`}
                  >
                    <span>🇪🇸</span>
                    <span>Español</span>
                  </button>
                </div>

                {/* Mobile Admin Trigger */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase font-mono text-stone-400 hover:text-[#C9A96E] border border-stone-200/50 px-4 py-2 rounded-full"
                >
                  <Lock className="h-3 w-3" />
                  <span>Admin Panel</span>
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
