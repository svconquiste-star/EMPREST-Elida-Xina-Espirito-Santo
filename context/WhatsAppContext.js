'use client';

import { createContext, useContext } from 'react';

const WHATSAPP_PHONE = '5527999289552';

const WhatsAppContext = createContext({
  phone: WHATSAPP_PHONE,
  buildLink: () => '',
});

export function WhatsAppProvider({ children }) {
  const buildLink = ({
    nome,
    cargo,
    tipoVinculo,
    cidade,
    telefone,
    rendaMensal,
    valorDesejado,
    nomeEmpresa2,
  }) => {
    const n = nome ? nome.trim() : '[NOME]';
    const cg = cargo ? cargo.trim() : '[CARGO]';
    const tv = tipoVinculo || 'CLT';
    const c = cidade ? cidade.trim() : '[CIDADE]';
    const t = telefone || '[TELEFONE]';
    const rm = rendaMensal ? `R$ ${rendaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '[RENDA]';
    const vd = valorDesejado ? `R$ ${valorDesejado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '[VALOR]';

    let empresaPart = '';
    if (tv === 'PJ' && nomeEmpresa2) {
      empresaPart = ` da empresa ${nomeEmpresa2.trim()}`;
    }

    const message =
      `Olá! Sou ${n}, sou ${cg}${empresaPart} e moro em ${c}. ` +
      `Trabalho como ${tv === 'CLT' ? 'CLT' : 'PJ'}. ` +
      `Minha renda mensal é de ${rm} e gostaria de um valor de ${vd}. ` +
      `Meu telefone é ${t}.`;

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
