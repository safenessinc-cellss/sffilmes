import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Film, Play } from 'lucide-react';
import { PortfolioItem, Language, Translation } from '../types';

function getEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already an embed URL, keep it
  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('player.vimeo.com/video/')) {
    return trimmed;
  }

  // YouTube Shorts Support
  // e.g., https://www.youtube.com/shorts/g09U7p2uicY
  if (trimmed.includes('/shorts/')) {
    const parts = trimmed.split('/shorts/');
    if (parts.length > 1) {
      const id = parts[1].split(/[?#]/)[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
  }

  // General YouTube regex
  const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&rel=0`;
  }

  // Vimeo Support
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return trimmed;
}

interface LightboxProps {
  photo: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentLang: Language;
  translations: Translation;
  currentIndex: number;
  totalPhotos: number;
}

export default function Lightbox({
  photo,
  isOpen,
  onClose,
  onPrev,
  onNext,
  currentLang,
  translations,
  currentIndex,
  totalPhotos,
}: LightboxProps) {
  
  // Listen for keyboard arrow keys and escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none"
          id="lightbox-container"
        >
          {/* Top Bar Controls */}
          <div className="relative z-10 w-full flex items-center justify-between p-6 md:px-12 border-b border-[#C9A96E]/10 bg-gradient-to-b from-black to-transparent">
            {/* Index Counter */}
            <div className="font-mono text-xs text-[#888888] tracking-[0.2em] uppercase">
              {currentIndex + 1} <span className="text-[#C9A96E]">/</span> {totalPhotos}
            </div>

            {/* Title / Studio Name */}
            <div className="hidden sm:block font-serif text-[#C9A96E] text-sm tracking-[0.15em] uppercase">
              ST FILMES &mdash; {photo.videoUrl ? 'CINEMA' : 'GALLERY'}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-[#FFFFFF] hover:text-[#C9A96E] transition-colors duration-300 p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center space-x-1"
              aria-label={translations.lightboxClose}
            >
              <span className="font-sans text-[10px] tracking-widest uppercase hidden md:inline">{translations.lightboxClose}</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Content Area (Image/Video and Navigation) */}
          <div className="relative flex-grow flex items-center justify-center p-4 md:p-12 overflow-hidden">
            
            {/* Left navigation arrow */}
            <button
              onClick={onPrev}
              className="absolute left-4 md:left-8 z-20 text-white/60 hover:text-[#C9A96E] transition-colors duration-300 p-3 rounded-full hover:bg-white/5 cursor-pointer"
              aria-label={translations.lightboxPrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            {/* Content Container (Responsive Photo or Video Iframe) */}
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-h-[70vh] md:max-h-[75vh] max-w-[85vw] md:max-w-[70vw] flex items-center justify-center relative p-2"
            >
              {photo.videoUrl ? (
                <div className="w-full h-full min-h-[350px] sm:min-h-[450px] md:min-h-[500px] aspect-video border border-white/10 shadow-2xl bg-black rounded overflow-hidden">
                  <iframe
                    src={getEmbedUrl(photo.videoUrl)}
                    title={photo.title[currentLang]}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <img
                  src={photo.url}
                  alt={photo.title[currentLang]}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] md:max-h-[75vh] max-w-[85vw] md:max-w-[70vw] object-contain shadow-2xl border border-white/5"
                />
              )}
            </motion.div>

            {/* Right navigation arrow */}
            <button
              onClick={onNext}
              className="absolute right-4 md:right-8 z-20 text-white/60 hover:text-[#C9A96E] transition-colors duration-300 p-3 rounded-full hover:bg-white/5 cursor-pointer"
              aria-label={translations.lightboxNext}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          {/* Bottom Descriptive Caption Panel */}
          <div className="relative z-10 w-full bg-gradient-to-t from-black to-black/60 border-t border-[#C9A96E]/10 p-6 md:p-10 text-white select-text">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Photo Title & Metadata */}
              <div className="flex-grow">
                <span className="font-mono text-[9px] tracking-[0.25em] text-[#C9A96E] uppercase block mb-1">
                  {photo.category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#FCFAF7] tracking-tight">
                  {currentLang === 'pt' ? photo.title.pt : photo.title.es}
                </h3>

                {/* Technical-style pills */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#888888] font-sans">
                  {photo.location && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#C9A96E]" />
                      <span>{photo.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span>{photo.year}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Film className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span>ST FILMES ORIGINAL</span>
                  </div>
                </div>
              </div>

              {/* Story / Description text */}
              {(photo.description?.pt || photo.description?.es) && (
                <div className="md:max-w-md">
                  <p className="font-sans text-xs sm:text-sm text-[#CCCCCC] leading-relaxed tracking-wide font-light">
                    {currentLang === 'pt' ? photo.description.pt : photo.description.es}
                  </p>
                </div>
              )}

            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
