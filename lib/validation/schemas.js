import { z } from 'zod';

export const submitContactSchema = z.object({
  nomeEmpresa: z
    .string()
    .min(2, 'Nome da empresa deve ter ao menos 2 caracteres')
    .max(255, 'Nome da empresa muito longo')
    .trim(),

  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(255, 'Nome muito longo')
    .trim(),

  telefone: z
    .string()
    .regex(/^\d{10,13}$/, 'Telefone inválido (10-13 dígitos)')
    .transform(d => d.startsWith('55') ? d : `55${d}`),

  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .optional()
    .or(z.literal('')),

  cidade: z
    .string()
    .min(2, 'Cidade deve ter ao menos 2 caracteres')
    .max(255, 'Cidade muito longa')
    .trim(),

  whatsappLink: z
    .string()
    .url('Link WhatsApp inválido')
    .optional(),
});
