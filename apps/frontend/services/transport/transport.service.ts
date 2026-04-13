import { fallbackLines, type FavoriteRecord, type TransportLine } from '@cityline/shared';
import type { DashboardData, MapLineView } from '@/types/dashboard';
import type { LineDirectionDetail, LineDirectionSummary } from '@/types/transport-detail';
import { requestApi } from '../api/client';
import { getAuthHeaders } from '../auth/auth.service';

const toMapLines = (lines: TransportLine[]): MapLineView[] =>
  lines.map((line) => ({
    id: line.id,
    code: line.code,
    name: line.name,
    color: line.color,
    status: line.status,
    origin: line.origin,
    destination: line.destination,
    mode: line.mode,
    fareLabel: line.fareLabel,
    path: line.path,
    stops: line.stops,
  }));

export async function getDashboardData(): Promise<DashboardData> {
  const [linesResult, favoritesResult, mapResult] = await Promise.allSettled([
    requestApi<TransportLine[]>('/lines', undefined, { revalidate: 60 }),
    requestApi<FavoriteRecord[]>('/favorites', undefined, { revalidate: 5 }),
    requestApi<MapLineView[]>('/map/lines', undefined, { revalidate: 60 }),
  ]);

  const lines = linesResult.status === 'fulfilled' ? linesResult.value : fallbackLines;

  return {
    lines,
    favorites: favoritesResult.status === 'fulfilled' ? favoritesResult.value : [],
    mapLines: mapResult.status === 'fulfilled' ? mapResult.value : toMapLines(lines),
    dataSource: linesResult.status === 'fulfilled' ? 'live' : 'fallback',
    lastUpdated: new Date().toISOString(),
  };
}

export async function getFavorites() {
  return requestApi<FavoriteRecord[]>(
    '/favorites',
    {
      headers: {
        ...getAuthHeaders(),
      },
    },
    { revalidate: 0 }
  );
}

export async function createFavorite(lineId: string, label?: string) {
  return requestApi<FavoriteRecord>(
    '/favorites',
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ lineId, label }),
    },
    { revalidate: 0 }
  );
}

export async function removeFavorite(favoriteId: string) {
  return requestApi<{ removedId: string }>(
    `/favorites/${favoriteId}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    },
    { revalidate: 0 }
  );
}

export async function getLineDirections(lineId: string) {
  return requestApi<LineDirectionSummary[]>(`/lines/${lineId}/directions`, { cache: 'no-store' }, { revalidate: 0 });
}

export async function getLineDirectionStops(lineId: string, directionId: string) {
  return requestApi<{
    lineId: string;
    lineCode: string;
    lineName: string;
    direction: Pick<LineDirectionDetail, 'id' | 'type' | 'label' | 'routeLabel' | 'origin' | 'destination'>;
    items: LineDirectionDetail['stops'];
  }>(`/lines/${lineId}/directions/${directionId}/stops`, { cache: 'no-store' }, { revalidate: 0 });
}

export async function getLineDirectionSchedules(lineId: string, directionId: string, dayType: string) {
  return requestApi<{
    lineId: string;
    lineCode: string;
    lineName: string;
    direction: Pick<LineDirectionDetail, 'id' | 'type' | 'label' | 'routeLabel' | 'origin' | 'destination'>;
    dayType: 'weekday' | 'saturday' | 'sunday';
    items: LineDirectionDetail['schedules']['weekday'];
    nextDepartures: LineDirectionDetail['nextDepartures'];
    summary: string;
    hasDeparturesToday: boolean;
  }>(`/lines/${lineId}/directions/${directionId}/schedules?dayType=${dayType}`, { cache: 'no-store' }, { revalidate: 0 });
}

export async function getLineDirectionPath(lineId: string, directionId: string) {
  return requestApi<{
    lineId: string;
    lineCode: string;
    lineName: string;
    direction: Pick<LineDirectionDetail, 'id' | 'type' | 'label' | 'routeLabel' | 'origin' | 'destination'>;
    path: LineDirectionDetail['path'];
  }>(`/lines/${lineId}/directions/${directionId}/path`, { cache: 'no-store' }, { revalidate: 0 });
}
