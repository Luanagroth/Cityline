import type { ApiMeta } from '@cityline/shared';
import type { Response } from 'express';

export const buildMeta = (meta: Partial<ApiMeta> = {}): ApiMeta => ({
  source: meta.source ?? 'fallback',
  lastUpdated: meta.lastUpdated ?? new Date().toISOString(),
  fallback: meta.fallback ?? meta.source === 'fallback',
  count: meta.count,
  query: meta.query,
});

export const sendOk = <T>(response: Response, data: T, meta?: Partial<ApiMeta>) => {
  response.json({
    success: true,
    data,
    meta: buildMeta(meta),
  });
};
