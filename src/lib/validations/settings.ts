import { z } from "zod"

export const updateSettingsSchema = z.object({
  confirmationHoursBefore: z.number().int().min(1).max(72).optional(),
  reminderHoursBefore: z.number().int().min(1).max(24).optional(),
  confirmationMessage: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").optional(),
  reminderMessage: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
