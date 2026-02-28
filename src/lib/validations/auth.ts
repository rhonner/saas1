import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200, "Nome deve ter no máximo 200 caracteres"),
  email: z.string().email("Email inválido").max(320, "Email deve ter no máximo 320 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128, "Senha deve ter no máximo 128 caracteres"),
  clinicName: z.string().min(3, "Nome da clínica deve ter pelo menos 3 caracteres").max(200, "Nome da clínica deve ter no máximo 200 caracteres"),
  avgAppointmentValue: z.number().min(0, "Valor não pode ser negativo").optional().default(0),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
