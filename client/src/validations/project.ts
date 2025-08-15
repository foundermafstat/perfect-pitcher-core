import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  shortDescription: z.string().min(10).max(2000),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>


