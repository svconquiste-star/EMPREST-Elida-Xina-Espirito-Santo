import prisma from '../db';
import { submitContactSchema } from '../validation/schemas';

export async function createContact(data, ipAddress, userAgent) {
  try {
    // Validar dados (inclui validação de nomeEmpresa2 obrigatório se PJ)
    const validated = submitContactSchema.parse(data);

    // Criar no BD com todos os campos
    const contact = await prisma.contact.create({
      data: {
        nomeEmpresa: 'XINA-ESPIRITO-SANTO', // Sempre fixo
        nome: validated.nome,
        cargo: validated.cargo,
        tipoVinculo: validated.tipoVinculo,
        rendaMensal: validated.rendaMensal,
        valorDesejado: validated.valorDesejado,
        nomeEmpresa2: validated.nomeEmpresa2 || null, // null se CLT
        telefone: validated.telefone,
        email: validated.email || null,
        cidade: validated.cidade,
        whatsappLink: validated.whatsappLink || null,
        ipAddress,
        userAgent,
      },
    });

    return contact;
  } catch (error) {
    // Re-throw validation errors
    if (error.name === 'ZodError') {
      throw error;
    }
    // Log other errors
    console.error('[contactService.createContact] Error:', error);
    throw new Error('Erro ao salvar contato no banco de dados');
  }
}
