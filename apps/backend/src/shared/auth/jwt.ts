import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name?: string | null;
}

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });

export const verifyAuthToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
