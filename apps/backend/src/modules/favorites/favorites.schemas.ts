import { z } from 'zod';

export const createFavoriteSchema = z.object({
  lineId: z.string().min(1, 'lineId é obrigatório.'),
  label: z.string().trim().max(50).optional(),
});
