import { z } from 'zod';

export const registryItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  meta: z
    .object({
      container: z.string().optional(),
    })
    .optional(),
  dependencies: z.array(z.string()).optional(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string().optional()
  })),
  type: z.enum(['components:ui', 'components:component'])
});
