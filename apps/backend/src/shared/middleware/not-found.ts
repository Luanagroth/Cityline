import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Rota não encontrada: ${request.method} ${request.originalUrl}`,
    },
  });
};
