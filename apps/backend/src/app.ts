import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { favoritesRouter } from './modules/favorites/favorites.routes.js';
import { transportRouter } from './modules/transport/transport.routes.js';
import { sendOk } from './shared/http/response.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { notFoundHandler } from './shared/middleware/not-found.js';

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
  })
);
app.use(express.json());

app.get('/health', (_request, response) => {
  sendOk(response, {
    status: 'ok',
    service: 'cityline-backend',
    timestamp: new Date().toISOString(),
  }, { source: 'fallback', fallback: false });
});

app.use('/api', transportRouter);
app.use('/api', authRouter);
app.use('/api', favoritesRouter);
app.use(notFoundHandler);
app.use(errorHandler);
