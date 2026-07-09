import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Mail, Phone, MapPin, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Language, Translation } from '../types';

interface ContactProps {
  currentLang: Language;
  translations: Translation;
  preselectedPackage?: string;
}

export default function Contact({ currentLang, translations, preselectedPackage }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Update message when a package is selected
  React.useEffect(() => {
    if (preselectedPackage) {
      if (currentLang === 'pt') {
        setMessage(`Olá, gostaria de solicitar uma proposta para o pacote "${preselectedPackage}". Aguardo contato.`);
      } else {
        setMessage(`Hola, me gustaría solicitar un presupuesto para el paquete "${preselectedPackage}". Quedo a la espera de su respuesta.`);
      }
    }
  }, [preselectedPackage, currentLang]);
  
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const tempErrors: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) tempErrors.name = translations.contactRequired;
    if (!email.trim()) {
      tempErrors.email = translations.contactRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = currentLang === 'pt' ? 'E-mail inválido' : 'Correo electrónico no válido';
    }
    if (!message.trim()) tempErrors.message = translations.contactRequired;

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate premium transmission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      
      // Reset success status after some time
      setTimeout(() => {
        setIsSuccess(false);
      }, 7000);
    }, 1800);
  };

  const socials = [
    { icon: <Instagram className="h-4 w-4" />, href: 'https://instagram.com/stfilmes', label: 'Instagram' },
    { icon: <Youtube className="h-4 w-4" />, href: 'https://vimeo.com/stfilmes', label: 'Vimeo' },
    { icon: <Linkedin className="h-4 w-4" />, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const locations = [
    { city: 'Lisboa', addr: 'Avenida da Liberdade, 110', email: 'lisboa@stfilmes.com' },
    { city: 'Madrid', addr: 'Paseo de la Castellana, 45', email: 'madrid@stfilmes.com' },
    { city: 'Milano', addr: 'Via della Spiga, 8', email: 'milano@stfilmes.com' },
  ];

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#FDFCFB] px-6 sm:px-10 lg:px-16 border-t border-[#F0EFEA]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-16">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] block mb-2">
            ST FILMES // AGENDA & CONTACTOS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#141414] font-normal tracking-tight">
            {translations.contactTitle}
          </h2>
          <p className="mt-4 max-w-xl text-xs sm:text-sm text-[#888888] font-sans leading-relaxed tracking-wide font-light">
            {translations.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Side: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Quick Contact info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-[#FDFCFB] p-2.5 rounded border border-[#F0EFEA] text-[#C9A96E]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-mono text-[10px] tracking-wider text-[#888888] uppercase">
                    E-mail Geral / Email General
                  </h4>
                  <a href="mailto:info@stfilmes.com" className="font-serif text-sm text-[#141414] hover:text-[#C9A96E] transition-colors duration-300">
                    info@stfilmes.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-[#FDFCFB] p-2.5 rounded border border-[#F0EFEA] text-[#C9A96E]">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-mono text-[10px] tracking-wider text-[#888888] uppercase">
                    Telefone / Teléfono
                  </h4>
                  <a href="tel:5551981323388" className="font-serif text-sm text-[#141414] hover:text-[#C9A96E] transition-colors duration-300">
                    +55 (51) 98132-3388
                  </a>
                </div>
              </div>
            </div>

            {/* Studio Hubs locations */}
            <div className="pt-8 border-t border-[#F0EFEA]">
              <h3 className="font-mono text-[9px] tracking-[0.25em] text-[#C9A96E] uppercase mb-6">
                ESTÚDIOS & HUB CONTATOS
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
                {locations.map((loc, i) => (
                  <div key={i} className="space-y-1">
                    <span className="font-serif text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                      {loc.city}
                    </span>
                    <span className="font-sans text-[11px] text-[#888888] block">
                      {loc.addr}
                    </span>
                    <a href={`mailto:${loc.email}`} className="font-sans text-[10px] text-[#C9A96E] hover:underline">
                      {loc.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Social media connections */}
            <div className="pt-8 border-t border-[#F0EFEA]">
              <h4 className="font-mono text-[9px] tracking-[0.25em] text-[#888888] uppercase mb-4">
                Redes Sociais
              </h4>
              <div className="flex space-x-4">
                {socials.map((soc, i) => (
                  <a
                    key={i}
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center p-2.5 rounded-full bg-[#FDFCFB] border border-[#F0EFEA] hover:border-[#C9A96E] text-[#888888] hover:text-[#C9A96E] hover:scale-105 transition-all duration-300 shadow-xs"
                    title={soc.label}
                    id={`social-link-${soc.label.toLowerCase()}`}
                  >
                    {soc.icon}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Sophisticated Message Form */}
          <div className="lg:col-span-7 bg-[#FDFCFB] border border-[#F0EFEA] p-8 sm:p-10 shadow-xs relative overflow-hidden">
            
            {/* Elegant decorative top gold line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A96E]/40 via-[#C9A96E] to-[#C9A96E]/40" />

            <form onSubmit={handleSubmit} className="space-y-6" id="st-filmes-contact-form">
              
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-widest text-[#888888] uppercase">
                  {translations.contactName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-4 py-3 bg-[#FDFCFB] border text-sm font-sans text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition-all duration-300 ${
                    errors.name ? 'border-red-400 focus:ring-red-400' : 'border-[#F0EFEA] hover:border-[#C9A96E]/40 focus:border-[#C9A96E]'
                  }`}
                  placeholder={currentLang === 'pt' ? 'Nome Completo / Empresa LTDA' : 'Nombre Completo / Empresa S.A.'}
                />
                {errors.name && <p className="text-red-500 font-sans text-[10px] tracking-wider mt-0.5">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-widest text-[#888888] uppercase">
                  {translations.contactEmail}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full px-4 py-3 bg-[#FDFCFB] border text-sm font-sans text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition-all duration-300 ${
                    errors.email ? 'border-red-400 focus:ring-red-400' : 'border-[#F0EFEA] hover:border-[#C9A96E]/40 focus:border-[#C9A96E]'
                  }`}
                  placeholder="exemplo@email.com"
                />
                {errors.email && <p className="text-red-500 font-sans text-[10px] tracking-wider mt-0.5">{errors.email}</p>}
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-widest text-[#888888] uppercase">
                  {currentLang === 'pt' ? 'Sua Mensagem' : 'Su Mensaje'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: undefined });
                  }}
                  rows={4}
                  className={`w-full px-4 py-3 bg-[#FDFCFB] border text-sm font-sans text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition-all duration-300 resize-none ${
                    errors.message ? 'border-red-400 focus:ring-red-400' : 'border-[#F0EFEA] hover:border-[#C9A96E]/40 focus:border-[#C9A96E]'
                  }`}
                  placeholder={translations.contactMessage}
                />
                {errors.message && <p className="text-red-500 font-sans text-[10px] tracking-wider mt-0.5">{errors.message}</p>}
              </div>

              {/* Success Notification */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-4 text-xs font-sans flex items-center space-x-3"
                    id="success-alert"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span>{translations.contactSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#141414] hover:bg-[#C9A96E] disabled:bg-stone-500 text-white font-sans text-xs tracking-[0.25em] uppercase py-4 font-semibold transition-colors duration-500 cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{translations.contactSend}</span>
                    <Send className="h-3 w-3" />
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
