import type { Request, RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { verifyAuthToken } from './jwt.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
}

const parseToken = (request: Request) => {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim();
};

export const optionalAuth: RequestHandler = (request, _response, next) => {
  const token = parseToken(request);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    (request as AuthenticatedRequest).authUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch {
    next();
  }
};

export const requireAuth: RequestHandler = (request, _response, next) => {
  const token = parseToken(request);

  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Faça login para acessar este recurso.'));
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    (request as AuthenticatedRequest).authUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Sua sessão expirou ou é inválida.'));
  }
};
