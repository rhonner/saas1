import { z } from "zod"

export const createPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().regex(/^\+55\d{10,11}$/, "Telefone inválido. Use formato +55XXXXXXXXXXX"),
  email: z.string().email("Email inválido").optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updatePatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  phone: z.string().regex(/^\+55\d{10,11}$/, "Telefone inválido. Use formato +55XXXXXXXXXXX").optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
