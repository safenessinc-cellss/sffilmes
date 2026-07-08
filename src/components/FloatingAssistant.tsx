import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, User, Sparkles, Phone, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

interface FloatingAssistantProps {
  currentLang: Language;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingAssistant({ currentLang }: FloatingAssistantProps) {
  const { config } = useApp();
  const whatsapp = config.whatsapp;

  // If whatsapp is not active or config not loaded, do not render
  if (!whatsapp || !whatsapp.active) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'direct'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: currentLang === 'pt'
        ? 'Olá! Seja muito bem-vindo à ST FILMES. Sou a assistente virtual da Steffany. Como posso ajudar você hoje?'
        : '¡Hola! Bienvenido a ST FILMES. Soy la asistente virtual de Steffany. ¿Cómo puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory,
          lang: currentLang
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || (currentLang === 'pt' 
          ? 'Desculpe, tive um contratempo. Poderia tentar de novo?' 
          : 'Disculpe, tuve un contratiempo. ¿Podría intentarlo de nuevo?')
      }]);
    } catch (error) {
      console.error('Error talking to AI Assistant:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: currentLang === 'pt'
          ? 'Não consegui me conectar ao servidor no momento. Por favor, utilize o botão de contato direto via WhatsApp abaixo!'
          : 'No pude conectarme al servidor en este momento. ¡Por favor, utilice el botón de contacto directo de WhatsApp a continuación!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const phone = whatsapp.phoneNumber.trim().replace(/[^0-9]/g, '');
    const defaultMsg = currentLang === 'pt' ? whatsapp.messagePt : whatsapp.messageEs;
    const encodedText = encodeURIComponent(defaultMsg);
    const url = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-[350px] sm:w-[380px] bg-white border border-[#C9A96E]/20 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
            id="ai-assistant-card"
          >
            {/* Header */}
            <div className="bg-[#141414] p-4 text-white flex justify-between items-center border-b border-[#C9A96E]/20">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-[#C9A96E]/20 rounded-lg text-[#C9A96E] animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm tracking-wide text-white">ST Assistant</h4>
                  <span className="text-[9px] font-mono tracking-widest text-[#C9A96E] uppercase">Atendimento Premium IA</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-white transition-colors duration-200 cursor-pointer"
                id="close-assistant-btn"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-stone-100 text-xs uppercase font-mono tracking-wider text-stone-500 bg-stone-50">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-center transition-colors ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-[#C9A96E] text-[#141414] font-semibold bg-white'
                    : 'hover:text-stone-800'
                }`}
                id="tab-ai-chat"
              >
                💬 Chat IA
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-3 text-center transition-colors ${
                  activeTab === 'direct'
                    ? 'border-b-2 border-[#C9A96E] text-[#141414] font-semibold bg-white'
                    : 'hover:text-stone-800'
                }`}
                id="tab-direct-whatsapp"
              >
                📞 WhatsApp Direto
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFAF7]/40 select-text">
              {activeTab === 'chat' ? (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`p-1.5 rounded-full shrink-0 ${
                          msg.role === 'user' ? 'bg-[#C9A96E]/20 text-[#C9A96E]' : 'bg-[#141414] text-[#C9A96E]'
                        }`}>
                          {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                        </div>
                        <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans ${
                          msg.role === 'user'
                            ? 'bg-[#C9A96E]/15 text-[#141414] rounded-tr-none border border-[#C9A96E]/20'
                            : 'bg-white text-stone-800 rounded-tl-none border border-stone-150 shadow-xs'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="p-1.5 rounded-full bg-[#141414] text-[#C9A96E] shrink-0">
                          <Sparkles className="h-3.5 w-3.5 animate-spin" />
                        </div>
                        <div className="p-3 bg-white border border-stone-150 rounded-xl rounded-tl-none shadow-xs text-stone-400 text-xs font-sans">
                          {currentLang === 'pt' ? 'ST Assistant está digitando...' : 'ST Assistant está escribiendo...'}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
                  <div className="p-4 bg-green-50 rounded-full text-green-600 border border-green-100 shadow-sm animate-bounce">
                    <Phone className="h-8 w-8" />
                  </div>
                  <div>
                    <h5 className="font-serif text-base text-[#141414] font-semibold">
                      {currentLang === 'pt' ? 'Falar com Steffany' : 'Hablar con Steffany'}
                    </h5>
                    <p className="mt-2 text-xs text-stone-500 leading-relaxed max-w-[240px]">
                      {currentLang === 'pt'
                        ? 'Inicie uma conversa direta conosco e obtenha resposta imediata sobre pacotes, datas e coberturas.'
                        : 'Inicie una conversación directa con nosotros y obtenga una respuesta inmediata sobre paquetes, fechas y coberturas.'}
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white py-3 px-6 rounded-lg font-sans text-xs tracking-wider uppercase font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/20 flex items-center justify-center space-x-2 cursor-pointer"
                    id="submit-whatsapp-redirect-btn"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{currentLang === 'pt' ? 'Abrir no WhatsApp' : 'Abrir en WhatsApp'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                    ST FILMES // WHATSAPP EXPRESS
                  </span>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            {activeTab === 'chat' && (
              <form onSubmit={handleSendMessage} className="p-3 bg-stone-50 border-t border-stone-100 flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentLang === 'pt' ? 'Digite sua mensagem...' : 'Escriba su mensaje...'}
                  className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#C9A96E]"
                  disabled={isLoading}
                  id="chat-input-text"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-[#141414] hover:bg-[#C9A96E] disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-lg transition-colors duration-200 cursor-pointer"
                  id="chat-send-btn"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#141414] text-[#C9A96E] hover:text-white p-4 rounded-full shadow-2xl border border-[#C9A96E]/30 flex items-center justify-center relative cursor-pointer group"
        id="floating-trigger-btn"
      >
        <span className="absolute inset-0 rounded-full bg-[#C9A96E]/20 animate-ping opacity-75 group-hover:hidden"></span>
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
