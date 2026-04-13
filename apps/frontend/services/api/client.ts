import type { ApiEnvelope } from '@cityline/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiRequestError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function requestApi<T>(
  path: string,
  init?: RequestInit,
  options?: { revalidate?: number }
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    next: {
      revalidate: options?.revalidate ?? 60,
    },
  });

  let payload: ApiEnvelope<T> | { success: false; error?: { message?: string } } | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T> | { success: false; error?: { message?: string } };
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      payload && 'success' in payload && payload.success === false && 'error' in payload
        ? payload.error?.message
        : undefined;

    throw new ApiRequestError(errorMessage ?? `Falha na requisição ${path}: ${response.status}`, response.status);
  }

  if (payload && 'success' in payload && payload.success === false) {
    const errorMessage = 'error' in payload ? payload.error?.message : undefined;
    throw new ApiRequestError(errorMessage ?? 'Erro desconhecido na API.', response.status);
  }

  if (payload && 'data' in payload) {
    return payload.data;
  }

  return payload as T;
}
