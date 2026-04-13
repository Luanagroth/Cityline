import type { FavoriteRecord, StopPoint, TransportLine, GeoPoint, LineStatus, TransportMode } from '@cityline/shared';

export interface MapLineView {
  id: string;
  code: string;
  name: string;
  color: string;
  status: LineStatus;
  origin: string;
  destination: string;
  mode?: TransportMode;
  fareLabel?: string;
  path: GeoPoint[];
  stops: StopPoint[];
}

export interface DashboardData {
  lines: TransportLine[];
  favorites: FavoriteRecord[];
  mapLines: MapLineView[];
  dataSource: 'live' | 'fallback';
  lastUpdated: string;
}
