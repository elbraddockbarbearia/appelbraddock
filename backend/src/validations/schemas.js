const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  nickname: z.string().min(1, 'Apelido é obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  password: z.string().min(3, 'Senha deve ter no mínimo 3 caracteres'),
});

const loginClientSchema = z.object({
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const createAppointmentSchema = z.object({
  client_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido'),
  barber_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de barbeiro inválido').optional().nullable(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data inválida' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (formato HH:MM)'),
  service_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de serviço inválido'),
  price: z.number().min(0, 'Preço inválido'),
});

module.exports = {
  registerSchema,
  loginClientSchema,
  createAppointmentSchema,
};
