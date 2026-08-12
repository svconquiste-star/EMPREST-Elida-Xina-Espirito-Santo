import prisma from '../db';
import { submitContactSchema } from '../validation/schemas';

export async function createContact(data, ipAddress, userAgent) {
  try {
    // Validar dados
    const validated = submitContactSchema.parse(data);

    // Criar no BD
    const contact = await prisma.contact.create({
      data: {
        nomeEmpresa: validated.nomeEmpresa,
        nome: validated.nome,
        telefone: validated.telefone,
        email: validated.email || null,
        cidade: validated.cidade,
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
