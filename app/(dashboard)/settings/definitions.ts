import z from "zod"

export const SettingsFormSchema = z.object({
    name: z.string().trim().min(1).max(50).optional(),
})

export type SettingsFormState =
  | {
    errors?: {
      name?: string[],
      image?: string[],
      global?: string[],
    }
    status?: number
    message?: string
  }
  | undefined
