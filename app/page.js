'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTracking } from '../hooks/useTracking';
import { useWhatsApp } from '../context/WhatsAppContext';
import { validatePhone, formatPhoneDisplay } from '../lib/phoneValidator';

export default function Page() {
  const tracking = useTracking();
  const { buildLink } = useWhatsApp();

  const nomeEmpresa = 'XINA-ESPIRITO-SANTO'; // Fixo e oculto

  // Step 1: Dados Básicos
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');

  // Step 2: Qualificação PJ
  const [cargo, setCargo] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState('CLT');
  const [rendaMensal, setRendaMensal] = useState('');
  const [valorDesejado, setValorDesejado] = useState('');
  const [nomeEmpresa2, setNomeEmpresa2] = useState('');

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Validações Step 1
  const phoneDigits = useMemo(() => String(telefone || '').replace(/\D/g, ''), [telefone]);
  const phoneResult = useMemo(() => validatePhone(phoneDigits), [phoneDigits]);
  const phoneDisplay = useMemo(() => (phoneDigits ? formatPhoneDisplay(phoneDigits) : ''), [phoneDigits]);

  const emailValid = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  // Validações Step 2
  const rendaMensalNum = useMemo(() => {
    try {
      return rendaMensal ? parseFloat(rendaMensal.replace(/[^0-9.-]/g, '')) : 0;
    } catch {
      return 0;
    }
  }, [rendaMensal]);

  const valorDesejadoNum = useMemo(() => {
    try {
      return valorDesejado ? parseFloat(valorDesejado.replace(/[^0-9.-]/g, '')) : 0;
    } catch {
      return 0;
    }
  }, [valorDesejado]);

  const canSubmitStep1 = Boolean(
    nome.trim().length > 1 &&
    phoneResult.valid &&
    emailValid &&
    cidade.trim().length > 1
  );

  const canSubmitStep2 = Boolean(
    cargo.trim().length > 1 &&
    rendaMensalNum > 0 &&
    valorDesejadoNum > 0 &&
    (tipoVinculo === 'CLT' || (tipoVinculo === 'PJ' && nomeEmpresa2.trim().length > 1))
  );

  useEffect(() => {
    tracking.trackViewContent();
  }, [tracking]);

  const handleStep1Next = () => {
    const newErrors = {};
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!phoneResult.valid) newErrors.telefone = phoneResult.error || 'Telefone inválido';
    if (email && !emailValid) newErrors.email = 'Email inválido';
    if (!cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
    // Dados são preservados
  };

  const handleStep2Submit = () => {
    const newErrors = {};
    if (!cargo.trim()) newErrors.cargo = 'Cargo/Função é obrigatório';
    if (rendaMensalNum <= 0) newErrors.rendaMensal = 'Renda mensal deve ser maior que zero';
    if (valorDesejadoNum <= 0) newErrors.valorDesejado = 'Valor desejado deve ser maior que zero';
    if (tipoVinculo === 'PJ' && !nomeEmpresa2.trim()) {
      newErrors.nomeEmpresa2 = 'Nome da empresa é obrigatório para PJ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // 1. Construir link WhatsApp com TODOS os dados
    const link = buildLink({
      nome: nome.trim(),
      cargo: cargo.trim(),
      tipoVinculo,
      cidade: cidade.trim(),
      telefone: phoneDisplay || phoneDigits,
      rendaMensal: rendaMensalNum,
      valorDesejado: valorDesejadoNum,
      nomeEmpresa2: tipoVinculo === 'PJ' ? nomeEmpresa2.trim() : undefined,
    });

    // 2. Abrir WhatsApp imediatamente
    window.open(link, '_blank', 'noopener,noreferrer');

    // 3. Track Pixel (SÓ se PJ - feito no tracking.js com condicional)
    tracking.trackContact({
      nome: nome.trim(),
      telefone: phoneDigits,
      email: email.trim() || undefined,
      cidade: cidade.trim(),
      tipoVinculo,
      valorDesejado: valorDesejadoNum,
    });

    // 4. Background: Salvar em BD
    saveContactAsync({
      nomeEmpresa: nomeEmpresa.trim(),
      nome: nome.trim(),
      cargo: cargo.trim(),
      tipoVinculo,
      telefone: phoneDigits,
      email: email.trim() || undefined,
      cidade: cidade.trim(),
      rendaMensal: String(rendaMensalNum),
      valorDesejado: String(valorDesejadoNum),
      nomeEmpresa2: tipoVinculo === 'PJ' ? nomeEmpresa2.trim() : '',
      whatsappLink: link,
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
          {currentStep === 1 && (
            <>
              {/* STEP 1: DADOS BÁSICOS */}
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
                  onClick={handleStep1Next}
                  disabled={!canSubmitStep1}
                >
                  Próximo passo
                </button>
                <div className="trust">
                  <i className="fa-solid fa-lock" style={{ color: 'var(--gold)', fontSize: '11px' }}></i>
                  Seus dados são protegidos e usados apenas para contato e atendimento.
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* STEP 2: QUALIFICAÇÃO */}
              <div className="form-group">
                <label className="label" htmlFor="cargo">
                  Cargo/Função/Ocupação *
                </label>
                <input
                  id="cargo"
                  className={`input ${errors.cargo ? 'input-error' : ''}`}
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex: Barbeiro, Eletricista, Vendedor"
                  autoComplete="off"
                />
                {errors.cargo && <span className="error-message">{errors.cargo}</span>}
              </div>

              <div className="form-group">
                <label className="label">Como você trabalha? *</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
                    <input
                      type="radio"
                      name="tipoVinculo"
                      value="CLT"
                      checked={tipoVinculo === 'CLT'}
                      onChange={(e) => setTipoVinculo(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    CLT (carteira assinada)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
                    <input
                      type="radio"
                      name="tipoVinculo"
                      value="PJ"
                      checked={tipoVinculo === 'PJ'}
                      onChange={(e) => setTipoVinculo(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    PJ (Autônomo/Empresário)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="rendaMensal">
                  Renda Mensal *
                </label>
                <input
                  id="rendaMensal"
                  className={`input ${errors.rendaMensal ? 'input-error' : ''}`}
                  value={rendaMensal}
                  onChange={(e) => setRendaMensal(e.target.value)}
                  placeholder="Ex: 5000,00"
                  type="number"
                  inputMode="decimal"
                />
                {errors.rendaMensal && <span className="error-message">{errors.rendaMensal}</span>}
              </div>

              <div className="form-group">
                <label className="label" htmlFor="valorDesejado">
                  Valor desejado *
                </label>
                <input
                  id="valorDesejado"
                  className={`input ${errors.valorDesejado ? 'input-error' : ''}`}
                  value={valorDesejado}
                  onChange={(e) => setValorDesejado(e.target.value)}
                  placeholder="Ex: 50000,00"
                  type="number"
                  inputMode="decimal"
                />
                {errors.valorDesejado && <span className="error-message">{errors.valorDesejado}</span>}
              </div>

              {tipoVinculo === 'PJ' && (
                <div className="form-group">
                  <label className="label" htmlFor="nomeEmpresa2">
                    Nome da Empresa *
                  </label>
                  <input
                    id="nomeEmpresa2"
                    className={`input ${errors.nomeEmpresa2 ? 'input-error' : ''}`}
                    value={nomeEmpresa2}
                    onChange={(e) => setNomeEmpresa2(e.target.value)}
                    placeholder="Nome da sua empresa"
                    autoComplete="off"
                  />
                  {errors.nomeEmpresa2 && <span className="error-message">{errors.nomeEmpresa2}</span>}
                </div>
              )}

              <div className="cta">
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-whatsapp"
                    type="button"
                    onClick={handleStep2Back}
                    style={{ flex: 1, backgroundColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    ← Voltar
                  </button>
                  <button
                    className="btn-whatsapp"
                    type="button"
                    onClick={handleStep2Submit}
                    disabled={!canSubmitStep2}
                    style={{ flex: 2 }}
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                    CHAMAR NO WHATSAPP
                  </button>
                </div>
                <div className="trust">
                  <i className="fa-solid fa-lock" style={{ color: 'var(--gold)', fontSize: '11px' }}></i>
                  Seus dados são protegidos e usados apenas para contato e atendimento.
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Atendimento via WhatsApp. Todos os direitos reservados.
      </footer>
    </main>
  );
}
