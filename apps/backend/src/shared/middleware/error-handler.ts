import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Os dados enviados são inválidos.',
        details: error.flatten(),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro inesperado ao processar a solicitação.',
    },
  });
};
