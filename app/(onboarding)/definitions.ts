import z from "zod"

export const OnboardingFormSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  vanity: z.string().trim(),
})

export type OnboardingFormState =
  | {
    errors?: {
      title?: string[],
      vanity?: string[],
      description?: string[],
      global?: string[],
    }
    status?: number
    message?: string
  }
  | undefined
