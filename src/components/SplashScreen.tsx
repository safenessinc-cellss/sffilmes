import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ocultar después de 2.5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="splash-container">
      <div className="camera-loader">
        {/* Cuerpo de la cámara */}
        <div className="camera-body">
          <div className="lens">
            <div className="lens-inner"></div>
            <div className="lens-flash"></div>
          </div>
          <div className="viewfinder"></div>
          <div className="flash">
            <div className="flash-light"></div>
          </div>
        </div>
        
        {/* Efecto de disparo */}
        <div className="shutter-effect">
          <div className="shutter-flash"></div>
        </div>
        
        {/* Texto */}
        <p className="splash-text">ST FILMES</p>
        <p className="splash-subtext">Capturando momentos...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
