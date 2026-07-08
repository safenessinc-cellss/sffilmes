export type Language = 'pt' | 'es';

export interface PortfolioItem {
  id: string;
  url: string; // Cover image or thumbnail URL
  videoUrl?: string; // Optional YouTube/Vimeo embed URL or direct video URL
  title: {
    pt: string;
    es: string;
  };
  category: 'casamento' | '15anos' | 'infantil' | 'cinematic';
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'wide';
  description: {
    pt: string;
    es: string;
  };
  year: string;
  location: string;
}

// Keep Photo as an alias to prevent breaking existing types if any
export type Photo = PortfolioItem;

export interface HeroConfig {
  titlePt: string;
  titleEs: string;
  titleHighlightPt: string;
  titleHighlightEs: string;
  subPt: string;
  subEs: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface AboutConfig {
  titlePt: string;
  titleEs: string;
  subtitlePt: string;
  subtitleEs: string;
  bioText1Pt: string;
  bioText1Es: string;
  bioText2Pt: string;
  bioText2Es: string;
  bioText3Pt: string;
  bioText3Es: string;
  imageUrl: string;
  statsYears: string;
  statsProjects: string;
  statsAwards: string;
}

export interface PromotionConfig {
  active: boolean;
  titlePt: string;
  titleEs: string;
  descriptionPt: string;
  descriptionEs: string;
  badgePt: string;
  badgeEs: string;
}

export interface PackageItem {
  id: string;
  namePt: string;
  nameEs: string;
  descriptionPt: string;
  descriptionEs: string;
  featuresPt: string[];
  featuresEs: string[];
  price?: string; // stored, but hidden by default on public side unless explicitly enabled
  showPrice?: boolean;
}

export interface PackageCategoryConfig {
  casamento: PackageItem[];
  quinceanera: PackageItem[];
  infantil: PackageItem[];
}

export interface StyleConfig {
  emotionsPt: string;
  emotionsEs: string;
  detailsPt: string;
  detailsEs: string;
  connectionsPt: string;
  connectionsEs: string;
  memoriesPt: string;
  memoriesEs: string;
}

export interface WhatsAppConfig {
  active: boolean;
  phoneNumber: string;
  messagePt: string;
  messageEs: string;
}

export interface AppConfig {
  hero: HeroConfig;
  about: AboutConfig;
  promotions: PromotionConfig;
  packages: PackageCategoryConfig;
  style: StyleConfig;
  whatsapp?: WhatsAppConfig;
}

export interface Translation {
  heroTagline: string;
  heroSub: string;
  navWorks: string;
  navAbout: string;
  navContact: string;
  filterAll: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutText1: string;
  aboutText2: string;
  aboutText3: string;
  aboutStatsYears: string;
  aboutStatsProjects: string;
  aboutStatsAwards: string;
  contactTitle: string;
  contactSubtitle: string;
  contactName: string;
  contactEmail: string;
  contactMessage: string;
  contactSend: string;
  contactSuccess: string;
  contactRequired: string;
  lightboxClose: string;
  lightboxPrev: string;
  lightboxNext: string;
  lightboxNextImage?: string;
}

export interface PricingConfig {
  baseWedding: number;
  baseQuinceanera: number;
  baseKids: number;
  baseCinematic: number;
  hourlyRate: number;
  extraStaffFee: number;
  droneFee: number;
  albumFee: number;
  cinematicVideoUpgrade: number;
}

export interface AIBudgetLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  justification: string;
}

export interface AIBudgetSalesPitch {
  subject: string;
  intro: string;
  body: string;
  closing: string;
}

export interface AIBudget {
  eventType: string;
  baseHoursIncluded: number;
  summary: string;
  lineItems: AIBudgetLineItem[];
  totalPrice: number;
  recommendations: string[];
  salesPitch: AIBudgetSalesPitch;
}

export interface SavedBudget {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientNeeds: string;
  pricingConfig: PricingConfig;
  generatedAt: string;
  budget: AIBudget;
}

export interface AdminAuthorization {
  email: string;
  displayName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  photoURL?: string;
}

