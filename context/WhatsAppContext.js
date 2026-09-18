'use client';

import { createContext, useContext } from 'react';

const WHATSAPP_PHONE = '5527999289552';

const WhatsAppContext = createContext({
  phone: WHATSAPP_PHONE,
  buildLink: () => '',
});

export function WhatsAppProvider({ children }) {
  const buildLink = ({ nome, cargo, cidade, telefone }) => {
    const n = nome ? nome.trim() : '[NOME]';
    const cg = cargo ? cargo.trim() : '[CARGO]';
    const c = cidade ? cidade.trim() : '[CIDADE]';
    const t = telefone || '[TELEFONE]';
    const message = `Olá! Sou ${n}, sou ${cg} e moro em ${c}, gostaria de um empréstimo. Meu telefone é ${t}`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  };

  return (
    <WhatsAppContext.Provider value={{ phone: WHATSAPP_PHONE, buildLink }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  return useContext(WhatsAppContext);
}
