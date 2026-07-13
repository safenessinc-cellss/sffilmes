import React from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', variant = 'dark', size = 'md' }: LogoProps) {
  const appContext = useApp();
  const logoConfig = appContext?.config?.logo || {
    useImage: false,
    imageUrl: '',
    text: 'ST',
    subtext: 'FILMES'
  };

  // Define color schemes
  // dark: black text/shapes with gold wolf
  // light: white text/shapes with gold wolf
  // gold: pure luxury gold (#C9A96E)
  const colors = {
    dark: {
      text: 'fill-[#111111]',
      subtext: 'fill-[#333333]',
      wolf: 'stroke-[#C9A96E]',
      line: 'stroke-[#C9A96E]/40',
    },
    light: {
      text: 'fill-[#FFFFFF]',
      subtext: 'fill-[#E6E6E6]',
      wolf: 'stroke-[#C9A96E]',
      line: 'stroke-[#C9A96E]/50',
    },
    gold: {
      text: 'fill-[#C9A96E]',
      subtext: 'fill-[#C9A96E]/90',
      wolf: 'stroke-[#C9A96E]',
      line: 'stroke-[#C9A96E]/60',
    },
  };

  const sizes = {
    sm: 'h-10 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-28 w-auto',
    xl: 'h-48 w-auto',
  };

  const currentColors = colors[variant];

  // If dynamic config says to use a custom image, render it
  if (logoConfig.useImage && logoConfig.imageUrl) {
    const sizeClasses = {
      sm: 'h-8 w-auto object-contain',
      md: 'h-12 w-auto object-contain',
      lg: 'h-20 w-auto object-contain',
      xl: 'h-32 w-auto object-contain',
    };
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={logoConfig.imageUrl || null}
          alt={logoConfig.text || "Logo"}
          className={sizeClasses[size]}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback back to SVG if image fails to load
            (e.target as any).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Fallback to beautiful SVG styled with custom text (first two initials)
  const textVal = logoConfig.text || 'ST';
  const char1 = textVal.charAt(0) || 'S';
  const char2 = textVal.charAt(1) || 'T';
  const subtextVal = logoConfig.subtext || 'FILMES';

  return (
    <div className={`flex flex-col items-center justify-center font-serif ${className}`}>
      <svg
        className={sizes[size]}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="st-filmes-logo-svg"
      >
        {/* S and T Letters rendered as beautiful paths or styled SVG text */}
        <text
          x="30"
          y="72"
          className={`${currentColors.text} font-normal`}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '66px',
            letterSpacing: '-2px',
          }}
        >
          {char1}
        </text>
        <text
          x="62"
          y="72"
          className={`${currentColors.text} font-normal`}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '66px',
            letterSpacing: '-2px',
          }}
        >
          {char2}
        </text>

        {/* Elegant Wolf Head outline intertwined with the lower loop of the 'S' */}
        {/* Center of the S loop is around x=42, y=65 */}
        <path
          d="M 43 55 
             C 41 49, 36 46, 32 46 
             C 27 50, 26 56, 27 61 
             C 29 67, 33 70, 39 71
             C 34 68, 33 65, 33 62
             C 33 59, 35 56, 39 55
             C 41 55, 43 57, 44 59"
          className={currentColors.wolf}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Wolf nose and chin detailing */}
        <path
          d="M 32 46 
             C 30 46, 28 48, 29 50 
             C 30 51, 31 52, 33 52"
          className={currentColors.wolf}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Wolf eye */}
        <circle cx="34.5" cy="51.5" r="0.75" fill="#C9A96E" />

        {/* Subtitle "F I L M E S" */}
        <text
          x="60"
          y="95"
          textAnchor="middle"
          className={`${currentColors.subtext} tracking-[0.55em] font-normal`}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '9px',
          }}
        >
          {subtextVal}
        </text>

        {/* Underline */}
        <line
          x1="45"
          y1="106"
          x2="75"
          y2="106"
          className={currentColors.line}
          strokeWidth="0.75"
        />
      </svg>
    </div>
  );
}
