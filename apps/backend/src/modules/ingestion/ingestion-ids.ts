const normalizeAscii = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const normalizeCoordinate = (value: number) =>
  value.toFixed(4).replace('.', '_').replace('-', 'm');

export const slugifyStable = (value: string) => normalizeAscii(value);

export const normalizeCodeToken = (value: string) => normalizeAscii(value);

export const buildStableTransportLineId = (
  transportMode: 'urban' | 'intercity' | 'ferry' | 'municipal' | 'intermunicipal',
  code: string
) => {
  const normalizedCode = normalizeCodeToken(code);
  return transportMode === 'ferry' ? `ferry-${normalizedCode}` : `line-${normalizedCode}`;
};

export const buildStableStopId = (name: string, latitude: number, longitude: number) =>
  `stop-${normalizeAscii(name)}-${normalizeCoordinate(latitude)}-${normalizeCoordinate(longitude)}`;

export const buildStableDirectionId = (lineId: string, type: 'outbound' | 'inbound', explicitId?: string) =>
  explicitId ?? `${lineId}-${type}`;

export const buildStableLineStopId = (directionId: string, sequence: number) => `${directionId}-stop-${sequence}`;

export const buildStableRoutePathId = (directionId: string, sequence: number) => `${directionId}-path-${sequence}`;

export const buildStableScheduleId = (directionId: string, serviceDay: string, departureTime: string, explicitId?: string) =>
  explicitId ?? `${directionId}-${serviceDay}-${departureTime.replace(':', '')}`;

export const buildStablePredictionId = (scheduleId: string, lineStopId: string) => `${scheduleId}-${lineStopId}-prediction`;

export const buildStableFareId = (lineId: string, label: string, riderCategory: string | undefined, sortOrder: number, explicitId?: string) =>
  explicitId ?? `${lineId}-fare-${normalizeAscii(riderCategory ? `${label}-${riderCategory}` : label)}-${sortOrder + 1}`;
