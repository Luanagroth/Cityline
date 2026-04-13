import { Router, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { favoritesService } from './favorites.service.js';
import { createFavoriteSchema } from './favorites.schemas.js';
import { sendOk } from '../../shared/http/response.js';
import { optionalAuth, type AuthenticatedRequest } from '../../shared/auth/auth.middleware.js';

const asyncHandler = (handler: RequestHandler): RequestHandler => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export const favoritesRouter = Router();

favoritesRouter.get(
  '/favorites',
  optionalAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const items = await favoritesService.listFavorites((request as AuthenticatedRequest).authUser?.id);
    sendOk(response, items, { source: 'fallback', fallback: false, count: items.length });
  })
);

favoritesRouter.post(
  '/favorites',
  optionalAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const payload = createFavoriteSchema.parse(request.body);
    const item = await favoritesService.addFavorite(payload, (request as AuthenticatedRequest).authUser?.id);
    response.status(201).json({ success: true, data: item });
  })
);

favoritesRouter.delete(
  '/favorites/:id',
  optionalAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const result = await favoritesService.removeFavorite(params.id, (request as AuthenticatedRequest).authUser?.id);
    sendOk(response, result, { source: 'fallback', fallback: false });
  })
);
