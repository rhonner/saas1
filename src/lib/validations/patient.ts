import { z } from "zod"

export const createPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200, "Nome deve ter no máximo 200 caracteres"),
  phone: z.string().regex(/^\+55\d{10,11}$/, "Telefone inválido. Use formato +55XXXXXXXXXXX"),
  email: z.string().email("Email inválido").max(320, "Email deve ter no máximo 320 caracteres").optional().nullable(),
  notes: z.string().max(2000, "Observações devem ter no máximo 2000 caracteres").optional().nullable(),
})

export const updatePatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200, "Nome deve ter no máximo 200 caracteres").optional(),
  phone: z.string().regex(/^\+55\d{10,11}$/, "Telefone inválido. Use formato +55XXXXXXXXXXX").optional(),
  email: z.string().email("Email inválido").max(320, "Email deve ter no máximo 320 caracteres").optional().nullable(),
  notes: z.string().max(2000, "Observações devem ter no máximo 2000 caracteres").optional().nullable(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
