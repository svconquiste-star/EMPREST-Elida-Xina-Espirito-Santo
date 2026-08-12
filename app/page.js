'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTracking } from '../hooks/useTracking';
import { useWhatsApp } from '../context/WhatsAppContext';
import { validatePhone, formatPhoneDisplay } from '../lib/phoneValidator';

export default function Page() {
  const tracking = useTracking();
  const { buildLink } = useWhatsApp();

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [errors, setErrors] = useState({});

  const phoneDigits = useMemo(() => String(telefone || '').replace(/\D/g, ''), [telefone]);
  const phoneResult = useMemo(() => validatePhone(phoneDigits), [phoneDigits]);
  const phoneDisplay = useMemo(() => (phoneDigits ? formatPhoneDisplay(phoneDigits) : ''), [phoneDigits]);

  const emailValid = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const canSubmit = Boolean(
    nomeEmpresa.trim().length > 1 &&
    nome.trim().length > 1 &&
    phoneResult.valid &&
    emailValid &&
    cidade.trim().length > 1
  );

  useEffect(() => {
    tracking.trackViewContent();
  }, [tracking]);

  const onSubmit = () => {
    const newErrors = {};
    if (!nomeEmpresa.trim()) newErrors.nomeEmpresa = 'Nome da empresa é obrigatório';
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!phoneResult.valid) newErrors.telefone = phoneResult.error || 'Telefone inválido';
    if (email && !emailValid) newErrors.email = 'Email inválido';
    if (!cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // 1. Abrir WhatsApp IMEDIATAMENTE
    const link = buildLink({
      nome: nome.trim(),
      cidade: cidade.trim(),
      telefone: phoneDisplay || phoneDigits,
    });

    window.open(link, '_blank', 'noopener,noreferrer');

    // 2. Track Pixel
    tracking.trackContact({
      nome: nome.trim(),
      telefone: phoneDigits,
      email: email.trim() || undefined,
      cidade: cidade.trim(),
    });

    // 3. Background: Salvar em BD (não bloqueia nada acima)
    saveContactAsync({
      nomeEmpresa: nomeEmpresa.trim(),
      nome: nome.trim(),
      telefone: phoneDigits,
      email: email.trim() || undefined,
      cidade: cidade.trim(),
    });
  };

  const saveContactAsync = async (data) => {
    try {
      const response = await fetch('/api/save-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });

      if (!response.ok) {
        console.warn('Erro ao salvar contato:', response.status);
      }
    } catch (error) {
      console.warn('Erro ao conectar com servidor:', error);
    }
  };

  return (
    <main className="container">
      <section className="card">
        <div className="badge">
          <i className="fa-solid fa-lock" style={{ color: 'var(--gold)' }}></i>
          Atendimento rápido e seguro
        </div>
        <h1 className="h1">Fale com um especialista agora no WhatsApp</h1>
        <p className="subtitle">Preencha seus dados e receba uma resposta rápida, com atendimento humano e sigiloso.</p>

        <div className="form" role="form" aria-label="Formulário de contato">
          <div className="form-group">
            <label className="label" htmlFor="nomeEmpresa">
              Nome da Empresa *
            </label>
            <input
              id="nomeEmpresa"
              className={`input ${errors.nomeEmpresa ? 'input-error' : ''}`}
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              placeholder="Nome da sua empresa"
              autoComplete="organization"
            />
            {errors.nomeEmpresa && <span className="error-message">{errors.nomeEmpresa}</span>}
          </div>

          <div className="form-group">
            <label className="label" htmlFor="nome">
              Nome *
            </label>
            <input
              id="nome"
              className={`input ${errors.nome ? 'input-error' : ''}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label className="label" htmlFor="telefone">
              Telefone *
            </label>
            <input
              id="telefone"
              className={`input ${errors.telefone ? 'input-error' : ''}`}
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="DD + número (ex: 31987654321)"
              autoComplete="tel"
              inputMode="numeric"
            />
            {errors.telefone && <span className="error-message">{errors.telefone}</span>}
            {phoneResult.valid && phoneDisplay && (
              <span className="trust-text">
                <i className="fa-solid fa-circle-check" style={{ color: 'var(--brand)' }}></i> {phoneDisplay}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="label" htmlFor="email">
              Email (opcional)
            </label>
            <input
              id="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              type="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="label" htmlFor="cidade">
              Cidade *
            </label>
            <input
              id="cidade"
              className={`input ${errors.cidade ? 'input-error' : ''}`}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Belo Horizonte"
              autoComplete="address-level2"
            />
            {errors.cidade && <span className="error-message">{errors.cidade}</span>}
          </div>

          <div className="cta">
            <button
              className="btn-whatsapp"
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
            >
              <i className="fa-brands fa-whatsapp"></i>
              CHAMAR NO WHATSAPP
            </button>
            <div className="trust">
              <i className="fa-solid fa-lock" style={{ color: 'var(--gold)', fontSize: '11px' }}></i>
              Seus dados são protegidos e usados apenas para contato e atendimento.
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Atendimento via WhatsApp. Todos os direitos reservados.
      </footer>
    </main>
  );
}
