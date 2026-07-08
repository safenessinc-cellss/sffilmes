import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './data/translations';
import { AppProvider, useApp } from './context/AppContext';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';
import About from './components/About';
import Contact from './components/Contact';
import Packages from './components/Packages';
import Promotions from './components/Promotions';
import AdminDashboard from './components/AdminDashboard';
import FloatingAssistant from './components/FloatingAssistant';
import Logo from './components/Logo';
import { Lock } from 'lucide-react';

function AppContent() {
  const [currentLang, setCurrentLang] = useState<Language>('pt');
  const [activeSection, setActiveSection] = useState<string>('hero');
  
  // Lightbox States
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Admin Panel State
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Prefilled Package Contact Message State
  const [preselectedPkg, setPreselectedPkg] = useState<string>('');

  const { config, portfolio } = useApp();
  const translations = TRANSLATIONS[currentLang];

  // Intersection Observer to highlight active navigation link automatically during scroll
  useEffect(() => {
    const sections = ['hero', 'works', 'packages', 'about', 'contact'];
    
    // Using a centered rootMargin so sections are highlighted when they occupy the center of the viewport
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth Navigation Trigger
  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Offset slightly for sticky header
      const headerOffset = sectionId === 'hero' ? 0 : 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  // Lightbox Navigation Functions
  const handleOpenLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === 0 ? portfolio.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(newIndex);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === portfolio.length - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(newIndex);
  };

  const handleSelectPackage = (packageName: string) => {
    setPreselectedPkg(packageName);
    handleNavigate('contact');
  };

  const selectedPhoto = selectedPhotoIndex !== null ? portfolio[selectedPhotoIndex] : null;

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#111111] font-sans antialiased selection:bg-[#C9A96E]/30 select-none flex flex-col justify-between">
      
      {/* Sticky Navigation Header */}
      <Header
        currentLang={currentLang}
        setLang={setCurrentLang}
        translations={translations}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        
        {/* Cover / Hero Cover */}
        <Hero
          currentLang={currentLang}
          translations={translations}
          onExplore={() => handleNavigate('works')}
        />

        {/* Dynamic Promotions Banner */}
        <Promotions currentLang={currentLang} />

        {/* Dynamic Asymmetrical Gallery Grid */}
        <Gallery
          currentLang={currentLang}
          translations={translations}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Dynamic Packages and Custom Offerings */}
        <Packages
          currentLang={currentLang}
          onSelectPackage={handleSelectPackage}
        />

        {/* Editorial Story / About Biography */}
        <About
          currentLang={currentLang}
          translations={translations}
        />

        {/* Message Booking & Studio Contacts */}
        <Contact
          currentLang={currentLang}
          translations={translations}
          preselectedPackage={preselectedPkg}
        />

      </main>

      {/* Full-screen Darkroom Lightbox */}
      <Lightbox
        photo={selectedPhoto}
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
        currentLang={currentLang}
        translations={translations}
        currentIndex={selectedPhotoIndex ?? 0}
        totalPhotos={portfolio.length}
      />

      {/* Admin Dashboard Editor Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentLang={currentLang}
      />

      {/* Floating AI Assistant & WhatsApp Button */}
      <FloatingAssistant currentLang={currentLang} />

      {/* Editorial Footer */}
      <footer className="bg-[#111111] text-[#CCCCCC] border-t border-[#C9A96E]/20 py-16 px-6 sm:px-10 lg:px-16 select-text">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Column 1: Small Logo & Brand */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <Logo size="md" variant="gold" className="transition-transform duration-500 hover:scale-[1.03]" />
            <p className="font-sans text-[10px] tracking-[0.2em] text-[#888888] uppercase">
              {currentLang === 'pt' ? 'DIREÇÃO DE FOTO & CENA' : 'DIRECCIÓN DE FOTO Y ESCENA'}
            </p>
          </div>

          {/* Column 2: Minimalist Navigation Directory */}
          <div className="md:col-span-4 text-center md:text-left space-y-3">
            <h4 className="font-mono text-[9px] tracking-[0.25em] text-[#C9A96E] uppercase mb-4">
              {currentLang === 'pt' ? 'DIRETÓRIO' : 'DIRECTORIO'}
            </h4>
            <ul className="space-y-2 text-xs font-sans tracking-widest uppercase">
              <li>
                <button
                  onClick={() => handleNavigate('hero')}
                  className="hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer text-left"
                >
                  {currentLang === 'pt' ? 'PÁGINA INICIAL' : 'PORTADA'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('works')}
                  className="hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer text-left"
                >
                  {translations.navWorks}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('packages')}
                  className="hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer text-left text-xs uppercase"
                >
                  {currentLang === 'pt' ? 'Planos & Cobertura' : 'Planes y Coberturas'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('about')}
                  className="hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer text-left"
                >
                  {translations.navAbout}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer text-left"
                >
                  {translations.navContact}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Fineprint legal catalog details */}
          <div className="md:col-span-4 text-center md:text-right space-y-4 text-[10px] tracking-wider text-[#888888] font-sans">
            <p className="font-mono uppercase">
              {currentLang === 'pt'
                ? 'DESENVOLVIDO EM CONCEITO ACADÉMICO E EDITORIAL'
                : 'DESARROLLADO EN CONCEPTO ACADÉMICO Y EDITORIAL'}
            </p>
            <p className="leading-relaxed font-light">
              ST FILMES &copy; {new Date().getFullYear()}. Todos os direitos reservados.
              <br />
              {currentLang === 'pt' 
                ? 'Estética inspirada nos catálogos de arte europeus.' 
                : 'Estética inspirada en los catálogos de arte europeos.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center space-x-1 text-[#C9A96E] hover:text-white transition-colors uppercase font-mono text-[9px] tracking-widest bg-stone-900/40 px-3 py-1.5 rounded border border-[#C9A96E]/20"
              >
                <Lock className="h-2.5 w-2.5" />
                <span>Portal Administrativo</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
