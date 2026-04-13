import { Router, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { transportService } from './transport.service.js';
import { sendOk } from '../../shared/http/response.js';

const asyncHandler = (handler: RequestHandler): RequestHandler => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

const daySchema = z.enum(['weekday', 'saturday', 'sunday']).default('weekday');
const modeSchema = z.enum(['urban', 'intercity', 'ferry']).optional();
const lineParamsSchema = z.object({ id: z.string().min(1) });
const directionParamsSchema = z.object({ id: z.string().min(1), directionId: z.string().min(1) });

export const transportRouter = Router();

transportRouter.get(
  '/lines',
  asyncHandler(async (request: Request, response: Response) => {
    const parsed = z.object({ mode: modeSchema }).parse(request.query);
    const result = await transportService.listLines(parsed.mode);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/lines/:id/directions',
  asyncHandler(async (request: Request, response: Response) => {
    const params = lineParamsSchema.parse(request.params);
    const result = await transportService.listDirections(params.id);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/lines/:id/directions/:directionId/stops',
  asyncHandler(async (request: Request, response: Response) => {
    const params = directionParamsSchema.parse(request.params);
    const result = await transportService.getDirectionStops(params.id, params.directionId);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/lines/:id/directions/:directionId/schedules',
  asyncHandler(async (request: Request, response: Response) => {
    const params = directionParamsSchema.parse(request.params);
    const query = z
      .object({
        dayType: daySchema.optional(),
        at: z.string().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(10).default(3),
      })
      .parse(request.query);

    const result = await transportService.getDirectionSchedules(
      params.id,
      params.directionId,
      query.dayType ?? 'weekday',
      query.at ? new Date(query.at) : new Date(),
      query.limit
    );
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/lines/:id/directions/:directionId/path',
  asyncHandler(async (request: Request, response: Response) => {
    const params = directionParamsSchema.parse(request.params);
    const result = await transportService.getDirectionPath(params.id, params.directionId);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/lines/:id',
  asyncHandler(async (request: Request, response: Response) => {
    const params = lineParamsSchema.parse(request.params);
    const result = await transportService.getLineById(params.id);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/schedules',
  asyncHandler(async (request: Request, response: Response) => {
    const parsed = z
      .object({
        lineId: z.string().optional(),
        dayType: daySchema.optional(),
        mode: modeSchema,
      })
      .parse(request.query);

    const result = await transportService.getSchedules(parsed.lineId, parsed.dayType ?? 'weekday', parsed.mode);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/search',
  asyncHandler(async (request: Request, response: Response) => {
    const parsed = z.object({ q: z.string().trim().default(''), mode: modeSchema }).parse(request.query);
    const result = await transportService.searchLines(parsed.q, parsed.mode);
    sendOk(response, result.data, result.meta);
  })
);

transportRouter.get(
  '/map/lines',
  asyncHandler(async (request: Request, response: Response) => {
    const parsed = z.object({ mode: modeSchema }).parse(request.query);
    const result = await transportService.getMapLines(parsed.mode);
    sendOk(response, result.data, result.meta);
  })
);
