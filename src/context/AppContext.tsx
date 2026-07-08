import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, PortfolioItem, Language } from '../types';
import { 
  listenToPortfolio, 
  listenToConfig, 
  savePortfolioItemToFirestore, 
  deletePortfolioItemFromFirestore, 
  saveConfigToFirestore, 
  seedInitialPortfolio, 
  seedInitialConfig,
  authenticateAdmin,
  logoutAdminFromFirebase
} from '../lib/firestoreService';

interface AppContextType {
  config: AppConfig;
  portfolio: PortfolioItem[];
  isAdmin: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updateConfig: (newConfig: AppConfig) => void;
  updatePortfolio: (newPortfolio: PortfolioItem[]) => void;
  resetToDefaults: () => void;
}

const DEFAULT_HERO = {
  titlePt: "Histórias",
  titleEs: "Historias",
  titleHighlightPt: "Esculpidas em Luz",
  titleHighlightEs: "Esculpidas en Luz",
  subPt: "Filmes e Memórias de Casamentos, 15 Anos & Eventos Sociais",
  subEs: "Películas y Recuerdos de Bodas, Quinceañeras y Eventos Sociales",
  imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
};

const DEFAULT_ABOUT = {
  titlePt: "Prazer, Sou Steffany!",
  titleEs: "¡Mucho gusto, soy Steffany!",
  subtitlePt: "Sou videomaker móbile e fundadora da ST Filmes",
  subtitleEs: "Soy videomaker móvil y fundadora de ST Filmes",
  bioText1Pt: "Minha paixão é transformar momentos especiais em lembranças que poderão ser revividas para sempre.",
  bioText1Es: "Mi pasión es transformar momentos especiales en recuerdos que podrán ser revividos para siempre.",
  bioText2Pt: "Através da filmagem e edição, procuro registrar não apenas o que acontece mas também as emoções, os detalhes e toda a magia que tornam cada história única.",
  bioText2Es: "A través de la filmación y edición, busco registrar no solo lo que sucede sino también las emociones, los detalles y toda la magia que hacen de cada historia algo único.",
  bioText3Pt: "Será um prazer fazer parte da sua história!",
  bioText3Es: "¡Será un placer formar parte de tu historia!",
  imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop",
  statsYears: "8",
  statsProjects: "250+",
  statsAwards: "12",
};

const DEFAULT_PROMOTIONS = {
  active: true,
  titlePt: "Especial Temporada de Sonhos 🌟",
  titleEs: "Especial Temporada de Sueños 🌟",
  descriptionPt: "Reserve a cobertura completa para o seu Casamento ou Festa de 15 Anos até o final do mês e ganhe de presente o mini-vídeo em formato Reel/Shorts em até 48 horas após o evento para compartilhar com seus amigos!",
  descriptionEs: "¡Reserva la cobertura completa para tu Boda o Fiesta de Quinceañera hasta el final del mes y recibe de regalo el mini-video en formato Reel/Shorts en menos de 48 horas tras el evento para compartir con tus amigos!",
  badgePt: "Oferta Exclusiva",
  badgeEs: "Oferta Exclusiva",
};

const DEFAULT_STYLE = {
  emotionsPt: "Sorrisos, lágrimas, surpresas e toda a intensidade de um dia inesquecível.",
  emotionsEs: "Risas, lágrimas, sorpresas y toda la intensidad de un día inolvidable.",
  detailsPt: "Cada detalhe da decoração, do vestido e do ambiente merece ser guardado com arte.",
  detailsEs: "Cada detalle de la decoración, del vestido y del ambiente merece ser guardado con arte.",
  connectionsPt: "A cumplicidade entre vocês, a família, os amigos e as conexões sinceras.",
  connectionsEs: "La complicidad entre ustedes, la familia, los amigos y las conexiones sinceras.",
  memoriesPt: "Filmes pensados como legados visuais que vão emocionar por gerações inteiras.",
  memoriesEs: "Películas pensadas como legados visuales que emocionarán durante generaciones enteras.",
};

const DEFAULT_WHATSAPP = {
  active: true,
  phoneNumber: "5551999999999",
  messagePt: "Olá! Gostaria de solicitar um orçamento para o meu evento.",
  messageEs: "¡Hola! Me gustaría solicitar un presupuesto para mi evento."
};

const DEFAULT_PACKAGES = {
  casamento: [
    {
      id: "cas-1",
      namePt: "Pacote Essencial Casamentos",
      nameEs: "Paquete Esencial Bodas",
      descriptionPt: "Ideal para registrar de forma magnífica os principais momentos da celebração.",
      descriptionEs: "Ideal para registrar de forma magnífica los momentos principales de la celebración.",
      featuresPt: [
        "Filmagem da cerimônia completa",
        "Entrada dos noivos e troca de votos/alianças",
        "Saída festiva dos recém-casados",
        "Recepção e comemoração",
        "Corte do bolo e brinde",
        "Vídeo editado com os melhores momentos",
        "Entrega digital em alta qualidade"
      ],
      featuresEs: [
        "Filmación de la ceremonia completa",
        "Entrada de los novios e intercambio de votos/anillos",
        "Salida festiva de los recién casados",
        "Recepción y celebración",
        "Corte del pastel y brindis",
        "Video editado con los mejores momentos",
        "Entrega digital en alta calidad"
      ],
      price: "700",
      showPrice: false
    },
    {
      id: "cas-2",
      namePt: "Pacote Memórias Casamentos",
      nameEs: "Paquete Memorias Bodas",
      descriptionPt: "Uma cobertura cinematográfica que envolve toda a emoção desde o making of.",
      descriptionEs: "Una cobertura cinematográfica que envuelve toda la emoción desde el making of.",
      featuresPt: [
        "Tudo do Pacote Essencial incluído",
        "Filmagem do making of dos noivos (preparação de cabelo, make e trajes)",
        "Bastidores exclusivos e momentos especiais pré-cerimônia",
        "Captação minuciosa de emoções e expectativas do casal",
        "Vídeo cinematográfico integrado completo (Making Of + Cerimônia + Festa)",
        "Entrega em nuvem segura para assistir online"
      ],
      featuresEs: [
        "Todo lo del Paquete Esencial incluido",
        "Filmación del making of de los novios (preparación de cabello, maquillaje y trajes)",
        "Bastidores exclusivos y momentos especiales pre-ceremonia",
        "Captura minuciosa de emociones y expectativas de la pareja",
        "Video cinematográfico integrado completo (Making Of + Ceremonia + Fiesta)",
        "Entrega en nube segura para ver en línea"
      ],
      price: "900",
      showPrice: false
    },
    {
      id: "cas-3",
      namePt: "Experiência Completa Casamentos",
      nameEs: "Experiencia Completa Bodas",
      descriptionPt: "A opção definitiva e mais luxuosa para cobrir cada detalhe da sua história.",
      descriptionEs: "La opción definitiva y más lujosa para cubrir cada detalle de tu historia.",
      featuresPt: [
        "Tudo do Pacote Memórias incluído",
        "Filmagem de ensaio Pré-Wedding especial",
        "Registros espontâneos e momentos naturais do casal no ensaio",
        "Vídeo cinematográfico do ensaio (Teaser pré-evento)",
        "Edição de gala unindo Pré-Wedding, Making Of e grande dia",
        "Suporte preferencial antes, durante e após o evento"
      ],
      featuresEs: [
        "Todo lo del Paquete Memorias incluido",
        "Filmación de ensayo Pre-Wedding especial",
        "Registros espontáneos y momentos naturales de la pareja en el ensayo",
        "Video cinematográfico del ensayo (Teaser pre-evento)",
        "Edición de gala uniendo Pre-Wedding, Making Of y el gran día",
        "Soporte preferencial antes, durante y después del evento"
      ],
      price: "1000",
      showPrice: false
    }
  ],
  quinceanera: [
    {
      id: "15-1",
      namePt: "Pacote Essencial 15 Anos",
      nameEs: "Paquete Esencial Quinceañera",
      descriptionPt: "Mais que uma festa, um momento único que merece ser lembrado.",
      descriptionEs: "Más que una fiesta, un momento único que merece ser recordado.",
      featuresPt: [
        "Filmagem da recepção dos convidados",
        "Entrada triunfal da debutante",
        "Cerimônias formais, homenagens e valsa",
        "Abertura oficial da pista de dança",
        "Vídeo editado com os melhores momentos",
        "Entrega digital em alta qualidade"
      ],
      featuresEs: [
        "Filmación de la recepción de invitados",
        "Entrada triunfal de la quinceañera",
        "Ceremonias formales, homenajes y vals",
        "Apertura oficial de la pista de baile",
        "Video editado con los mejores momentos",
        "Entrega digital en alta calidad"
      ],
      price: "600",
      showPrice: false
    },
    {
      id: "15-2",
      namePt: "Pacote Memórias 15 Anos",
      nameEs: "Paquete Memorias Quinceañera",
      descriptionPt: "Uma experiência cinematográfica rica, registrando desde os preparativos.",
      descriptionEs: "Una experiencia cinematográfica rica, registrando desde los preparativos.",
      featuresPt: [
        "Tudo do Pacote Essencial incluído",
        "Filmagem completa do making of da debutante (preparação, cabelo, maquiagem e vestido)",
        "Bastidores especiais antes da chegada dos convidados",
        "Mensagens e entrevistas espontâneas dos convidados e familiares (opcional)",
        "Vídeo dinâmico integrando making of, cerimônia e festa"
      ],
      featuresEs: [
        "Todo lo del Paquete Esencial incluido",
        "Filmación completa del making of de la quinceañera (preparación, cabello, maquillaje y vestido)",
        "Bastidores especiales antes de la llegada de los invitados",
        "Mensajes y entrevistas espontáneas de invitados y familiares (opcional)",
        "Video dinámico integrando making of, ceremonia y fiesta"
      ],
      price: "800",
      showPrice: false
    },
    {
      id: "15-3",
      namePt: "Experiência Completa 15 Anos",
      nameEs: "Experiencia Completa Quinceañera",
      descriptionPt: "A joia da coroa para imortalizar os seus 15 anos com excelência e arte.",
      descriptionEs: "La joya de la corona para inmortalizar tus 15 años con excelencia y arte.",
      featuresPt: [
        "Tudo do Pacote Memórias incluído",
        "Filmagem de ensaio fotográfico/vídeo da debutante",
        "Registros espontâneos e artísticos no ensaio",
        "Teaser dinâmico do ensaio para passar no dia da festa",
        "Edição premium integrando ensaio externo, making of e festa",
        "Entrega com prioridade máxima e pendrive de luxo"
      ],
      featuresEs: [
        "Todo lo del Paquete Memorias incluido",
        "Filmación de ensayo fotográfico/video de la quinceañera",
        "Registros espontáneos y artísticos en el ensayo",
        "Teaser dinámico del ensayo para proyectar el día de la fiesta",
        "Edición premium integrando ensayo externo, making of y fiesta",
        "Entrega con prioridad máxima y pendrive de lujo"
      ],
      price: "920",
      showPrice: false
    }
  ],
  infantil: [
    {
      id: "inf-1",
      namePt: "Pacote Festa Infantil",
      nameEs: "Paquete Fiesta Infantil",
      descriptionPt: "Registrando alegria, sorrisos e momentos mágicos que ficam para sempre.",
      descriptionEs: "Registrando alegría, sonrisas y momentos mágicos que quedan para siempre.",
      featuresPt: [
        "Filmagem da decoração e detalhes do salão",
        "Recepção dos convidados e familiares",
        "Entrada da criança e brincadeiras espontâneas",
        "Momento do parabéns e corte do bolo",
        "Vídeo editado com trilha sonora divertida",
        "Entrega digital em alta qualidade"
      ],
      featuresEs: [
        "Filmación de la decoración y detalles del salón",
        "Recepción de los invitados y familiares",
        "Entrada del niño/a y juegos espontáneos",
        "Momento del cumpleaños feliz y corte del pastel",
        "Video editado con banda sonora divertida",
        "Entrega digital en alta calidad"
      ],
      price: "350",
      showPrice: false
    },
    {
      id: "inf-2",
      namePt: "Pacote Sonhos Infantil",
      nameEs: "Paquete Sueños Infantil",
      descriptionPt: "A cobertura de festa perfeita unida a um ensaio doce e espontâneo.",
      descriptionEs: "La cobertura de fiesta perfecta unida a un ensayo dulce y espontáneo.",
      featuresPt: [
        "Tudo do Pacote Festa incluído",
        "Filmagem de ensaio fotográfico infantil externo ou em estúdio",
        "Registros espontâneos focados na personalidade da criança durante o ensaio",
        "Vídeo teaser lúdico do ensaio",
        "Edição profissional combinando o ensaio mágico e a grande festa"
      ],
      featuresEs: [
        "Todo lo del Paquete Fiesta incluido",
        "Filmación de ensayo fotográfico infantil externo o en estudio",
        "Registros espontáneos enfocados en la personalidad del niño/a durante el ensayo",
        "Video teaser lúdico del ensayo",
        "Edición profesional combinando el ensayo mágico y la gran fiesta"
      ],
      price: "470",
      showPrice: false
    }
  ]
};

const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/g09U7p2uicY",
    title: {
      pt: "Casamento de Luísa & Guilherme",
      es: "Boda de Luísa y Guilherme"
    },
    category: "casamento",
    aspectRatio: "wide",
    description: {
      pt: "Filme de casamento cinematográfico capturado na Serra Gaúcha. Uma atmosfera repleta de romance e pôr do sol dourado.",
      es: "Película de boda cinematográfica capturada en la Serra Gaúcha. Una atmósfera repleta de romance y puesta de sol dorada."
    },
    year: "2026",
    location: "Gramado, RS"
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: {
      pt: "Os 15 Anos de Mariana",
      es: "Los 15 Años de Mariana"
    },
    category: "15anos",
    aspectRatio: "portrait",
    description: {
      pt: "Uma festa encantadora, repleta de brilho, valsa emocionante e momentos inesquecíveis em família.",
      es: "Una fiesta encantadora, llena de brillo, vals emocionante y momentos inolvidables en familia."
    },
    year: "2026",
    location: "Canoas, RS"
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "",
    title: {
      pt: "O Aniversário do Pequeno Theo",
      es: "El Cumpleaños del Pequeño Theo"
    },
    category: "infantil",
    aspectRatio: "square",
    description: {
      pt: "Registrando a pura alegria, as brincadeiras sinceras e os sorrisos iluminados na comemoração do Theo.",
      es: "Registrando la pura alegría, los juegos sinceros y las sonrisas iluminadas en la celebración de Theo."
    },
    year: "2025",
    location: "Novo Hamburgo, RS"
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: {
      pt: "Cerimônia de Sofia & André",
      es: "Ceremonia de Sofia y André"
    },
    category: "casamento",
    aspectRatio: "landscape",
    description: {
      pt: "Registrando olhares sinceros, juras de amor eterno e a maravilhosa emoção da saída dos noivos.",
      es: "Registrando miradas sinceras, promesas de amor eterno y la maravillosa emoción de la salida de los novios."
    },
    year: "2026",
    location: "Porto Alegre, RS"
  },
  {
    id: "p5",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "",
    title: {
      pt: "Ensaio Pré-Festa de Valentina",
      es: "Ensayo Pre-Fiesta de Valentina"
    },
    category: "15anos",
    aspectRatio: "portrait",
    description: {
      pt: "Vídeo-ensaio focado nos detalhes, na expressão autêntica e na doçura dos sonhos de debutante no Vale dos Vinhedos.",
      es: "Video-ensayo centrado en los detalles, la expresión auténtica y la dulzura de los sueños de quinceañera en el Vale dos Vinhedos."
    },
    year: "2026",
    location: "Bento Gonçalves, RS"
  },
  {
    id: "p6",
    url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "",
    title: {
      pt: "O Reino Encantado de Clara",
      es: "El Reino Encantado de Clara"
    },
    category: "infantil",
    aspectRatio: "landscape",
    description: {
      pt: "Toda a magia de uma decoração planejada com carinho e a fofura de Clara no seu segundo aninho.",
      es: "Toda la magia de una decoración planeada con cariño y la ternura de Clara en su segundo añito."
    },
    year: "2025",
    location: "Gravataí, RS"
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('st_filmes_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          whatsapp: parsed.whatsapp || DEFAULT_WHATSAPP
        };
      } catch (e) {
        console.error("Error loading config", e);
      }
    }
    return {
      hero: DEFAULT_HERO,
      about: DEFAULT_ABOUT,
      promotions: DEFAULT_PROMOTIONS,
      packages: DEFAULT_PACKAGES,
      style: DEFAULT_STYLE,
      whatsapp: DEFAULT_WHATSAPP,
    };
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('st_filmes_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading portfolio", e);
      }
    }
    return DEFAULT_PORTFOLIO;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('st_filmes_admin') === 'true';
  });

  // 1. Seed database and initialize real-time listeners on mount
  useEffect(() => {
    const initializeFirebaseData = async () => {
      // Authenticate anonymously as admin to ensure standard write permissions are available
      await authenticateAdmin();
      
      const defaultAppConfig: AppConfig = {
        hero: DEFAULT_HERO,
        about: DEFAULT_ABOUT,
        promotions: DEFAULT_PROMOTIONS,
        packages: DEFAULT_PACKAGES,
        style: DEFAULT_STYLE,
        whatsapp: DEFAULT_WHATSAPP,
      };

      // Seed databases if empty
      await seedInitialConfig(defaultAppConfig);
      await seedInitialPortfolio(DEFAULT_PORTFOLIO);
    };

    initializeFirebaseData().catch(err => console.warn("Firebase seeding/init notice (handled):", err));

    // Real-time listener for Portfolio items
    const unsubscribePortfolio = listenToPortfolio(
      (updatedPortfolio) => {
        if (updatedPortfolio.length > 0) {
          // Sort items alphabetically/numerically by id so they stay in consistent order
          const sorted = [...updatedPortfolio].sort((a, b) => a.id.localeCompare(b.id));
          setPortfolio(sorted);
        }
      },
      (error) => console.warn("Realtime portfolio subscription warning:", error)
    );

    // Real-time listener for Config settings
    const unsubscribeConfig = listenToConfig(
      (updatedConfig) => {
        if (updatedConfig) {
          setConfig({
            ...updatedConfig,
            whatsapp: updatedConfig.whatsapp || DEFAULT_WHATSAPP
          });
        }
      },
      (error) => console.warn("Realtime config subscription warning:", error)
    );

    return () => {
      unsubscribePortfolio();
      unsubscribeConfig();
    };
  }, []);

  // Sync to local storage as fallback/cache
  useEffect(() => {
    localStorage.setItem('st_filmes_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('st_filmes_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const loginAdmin = (password: string): boolean => {
    const clean = password.trim().toLowerCase();
    if (
      clean === 'safeness.c.a@gmail' || 
      clean === 'safeness.c.a@gmail.com' || 
      clean === 'safeness' ||
      clean.includes('admin') || 
      clean === 'steffany' || 
      clean === 'stfilmes'
    ) {
      setIsAdmin(true);
      sessionStorage.setItem('st_filmes_admin', 'true');
      authenticateAdmin().catch(err => console.warn("Firebase auth login notice:", err));
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('st_filmes_admin');
    logoutAdminFromFirebase().catch(err => console.warn("Firebase auth logout notice:", err));
  };

  const updateConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      await saveConfigToFirestore(newConfig);
    } catch (e) {
      console.warn("Failed to save config to Firestore:", e);
    }
  };

  const updatePortfolio = async (newPortfolio: PortfolioItem[]) => {
    // Optimistically update local UI state
    setPortfolio(newPortfolio);

    try {
      // Diff current versus new portfolio to handle added, edited, and deleted items
      const previousIds = new Set<string>(portfolio.map(item => item.id));
      const newIds = new Set<string>(newPortfolio.map(item => item.id));

      const deletedIds = [...previousIds].filter(id => !newIds.has(id));
      
      // Delete removed documents
      for (const id of deletedIds) {
        await deletePortfolioItemFromFirestore(id);
      }

      // Save/update added or modified documents
      for (const item of newPortfolio) {
        await savePortfolioItemToFirestore(item);
      }
    } catch (e) {
      console.warn("Failed to sync portfolio update to Firestore:", e);
    }
  };

  const resetToDefaults = async () => {
    const defaultConfig: AppConfig = {
      hero: DEFAULT_HERO,
      about: DEFAULT_ABOUT,
      promotions: DEFAULT_PROMOTIONS,
      packages: DEFAULT_PACKAGES,
      style: DEFAULT_STYLE,
    };
    setConfig(defaultConfig);
    setPortfolio(DEFAULT_PORTFOLIO);

    try {
      await saveConfigToFirestore(defaultConfig);
      // Clean and recreate portfolio on Firestore
      for (const item of portfolio) {
        await deletePortfolioItemFromFirestore(item.id);
      }
      for (const item of DEFAULT_PORTFOLIO) {
        await savePortfolioItemToFirestore(item);
      }
    } catch (e) {
      console.warn("Failed to reset Firestore to defaults:", e);
    }
  };

  return (
    <AppContext.Provider value={{
      config,
      portfolio,
      isAdmin,
      loginAdmin,
      logoutAdmin,
      updateConfig,
      updatePortfolio,
      resetToDefaults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
