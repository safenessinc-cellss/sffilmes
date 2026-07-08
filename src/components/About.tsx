import React from 'react';
import { motion } from 'motion/react';
import { Award, Film, Trophy } from 'lucide-react';
import { Language, Translation } from '../types';
import { useApp } from '../context/AppContext';

interface AboutProps {
  currentLang: Language;
  translations: Translation;
}

export default function About({ currentLang, translations }: AboutProps) {
  const { config } = useApp();
  const { about } = config;

  const stats = [
    {
      icon: <Film className="h-5 w-5 text-[#C9A96E]" />,
      value: about.statsYears,
      label: translations.aboutStatsYears,
    },
    {
      icon: <Trophy className="h-5 w-5 text-[#C9A96E]" />,
      value: about.statsProjects,
      label: translations.aboutStatsProjects,
    },
    {
      icon: <Award className="h-5 w-5 text-[#C9A96E]" />,
      value: about.statsAwards,
      label: translations.aboutStatsAwards,
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-[#FDFCFB] px-6 sm:px-10 lg:px-16 border-t border-[#F0EFEA] select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Subtitle Marker */}
        <div className="mb-16">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] block mb-2">
            ST FILMES // BIOGRAFIA & VISÃO
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#141414] font-normal tracking-tight">
            {currentLang === 'pt' ? about.titlePt : about.titleEs}
          </h2>
        </div>

        {/* Dynamic Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left: Beautiful Magazine Imagery */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute inset-4 border border-[#F0EFEA] pointer-events-none z-20 transition-transform duration-500 group-hover:scale-[1.03]" />
            <div className="relative overflow-hidden bg-[#EAE8E4] image-placeholder shadow-xl">
              <img
                src={about.imageUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop"}
                alt="ST FILMES Studio Scene"
                referrerPolicy="no-referrer"
                className="w-full h-[450px] object-cover filter grayscale transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#C9A96E]/5 mix-blend-color pointer-events-none" />
            </div>
            
            {/* Stamp Detail */}
            <div className="absolute -bottom-6 -right-6 bg-[#FDFCFB] border border-[#F0EFEA] px-6 py-4 shadow-xs hidden sm:block">
              <p className="font-serif text-[10px] tracking-widest uppercase text-[#C9A96E] font-semibold text-center">
                ESTÉTICA GLOSS
              </p>
              <p className="font-mono text-[8px] text-[#888888] tracking-widest text-center mt-1">
                CONTRASTE & LUZ
              </p>
            </div>
          </div>

          {/* Right: Editorial Narrative Text */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6 text-[#141414]">
              <p className="font-serif text-lg sm:text-xl text-[#C9A96E] leading-relaxed italic font-light border-l-2 border-[#C9A96E] pl-6">
                "{currentLang === 'pt' ? about.subtitlePt : about.subtitleEs}"
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 text-xs sm:text-sm text-[#444444] font-sans leading-relaxed tracking-wide font-light">
                <div className="space-y-4">
                  <p>{currentLang === 'pt' ? about.bioText1Pt : about.bioText1Es}</p>
                  <p>{currentLang === 'pt' ? about.bioText2Pt : about.bioText2Es}</p>
                </div>
                <div className="space-y-4">
                  <p>{currentLang === 'pt' ? about.bioText3Pt : about.bioText3Es}</p>
                  <p className="text-[#C9A96E] font-medium font-serif italic mt-2 text-sm">
                    {currentLang === 'pt' 
                      ? '“A luz desenha o corpo, a sombra esculpe a alma.”' 
                      : '“La luz dibuja el cuerpo, la sombra esculpe el alma.”'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Statistics Showcase */}
            <div className="mt-16 pt-10 border-t border-[#F0EFEA] grid grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-start border-r border-[#F0EFEA] last:border-0 pr-4">
                  <div className="mb-2 bg-[#FDFCFB] p-2 rounded border border-[#F0EFEA]">
                    {stat.icon}
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl text-[#141414] font-semibold tracking-tight">
                    {stat.value}
                  </span>
                  <span className="font-sans text-[10px] tracking-widest uppercase text-[#888888] mt-1 line-clamp-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
