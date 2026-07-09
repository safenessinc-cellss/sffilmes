import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    // Completely unmount after transition (2.5s + 0.8s = 3.3s)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`splash-overlay ${isFading ? 'fade-out' : ''}`} id="st-splash-screen">
      {/* Simulation of a real-world camera flash element */}
      <div className="splash-flash" />
      
      <div className="camera-wrapper">
        <div className="camera-top" />
        <div className="camera-body" />
        <div className="camera-lens-outer">
          <div className="camera-lens-inner">
            <div className="camera-lens-reflection" />
          </div>
        </div>
        <div className="camera-flash-light" />
      </div>
      
      <h1 className="splash-brand">ST FILMES</h1>
      <p className="splash-subtitle">Capturando momentos...</p>
    </div>
  );
}
