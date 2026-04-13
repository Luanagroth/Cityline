import type { ServiceDay } from '@cityline/shared';
import { buildLineDirections, getDepartureTiming, getNextDepartures } from '@/lib/transport';
import { getLineDirectionPath, getLineDirectionSchedules, getLineDirectionStops } from '@/services/transport/transport.service';
import type { DashboardData } from '@/types/dashboard';
import type { LineDirectionDetail, LineDirectionSummary } from '@/types/transport-detail';

const toFallbackDirectionType = (directionId: string) => (directionId.endsWith('outbound') ? 'outbound' : 'inbound');

export const buildFallbackNextDepartures = (direction: ReturnType<typeof buildLineDirections>[number], dayType: ServiceDay, referenceTime: Date | null) =>
  (referenceTime ? getNextDepartures(direction.schedules[dayType], referenceTime) : direction.schedules[dayType].slice(0, 3)).map((item) => {
    const timing = referenceTime ? getDepartureTiming(item.time, referenceTime) : { label: 'Horario planejado', minutesUntil: 0, status: 'upcoming' as const };
    return { id: item.id, time: item.time, dayType: item.dayType, minutesUntil: timing.minutesUntil, status: timing.status === 'now' ? 'now' : 'upcoming', label: timing.label, platform: item.platform, isPeak: item.isPeak, occupancy: item.occupancy, isTomorrow: false } as LineDirectionDetail['nextDepartures'][number];
  });

export const buildDirectionDetailFromResponses = (
  line: DashboardData['lines'][number],
  dayType: ServiceDay,
  stopsResponse: Awaited<ReturnType<typeof getLineDirectionStops>>,
  schedulesResponse: Awaited<ReturnType<typeof getLineDirectionSchedules>>,
  pathResponse: Awaited<ReturnType<typeof getLineDirectionPath>>
): LineDirectionDetail => ({
  id: schedulesResponse.direction.id,
  lineId: line.id,
  lineCode: line.code,
  lineName: line.name,
  type: schedulesResponse.direction.type,
  label: schedulesResponse.direction.label,
  routeLabel: schedulesResponse.direction.routeLabel,
  origin: schedulesResponse.direction.origin,
  destination: schedulesResponse.direction.destination,
  mode: line.mode,
  fareLabel: line.fareLabel,
  stops: stopsResponse.items,
  path: pathResponse.path,
  schedules: { weekday: dayType === 'weekday' ? schedulesResponse.items : [], saturday: dayType === 'saturday' ? schedulesResponse.items : [], sunday: dayType === 'sunday' ? schedulesResponse.items : [] },
  nextDepartures: schedulesResponse.nextDepartures,
  nextSummary: schedulesResponse.summary,
  hasDeparturesToday: schedulesResponse.hasDeparturesToday,
});

export const fallbackDirectionSummariesFromLine = (line: DashboardData['lines'][number]): LineDirectionSummary[] =>
  buildLineDirections(line).map((direction) => ({ id: direction.id, lineId: line.id, lineCode: line.code, lineName: line.name, type: toFallbackDirectionType(direction.id), label: `${direction.origin} -> ${direction.destination}`, routeLabel: direction.routeLabel, origin: direction.origin, destination: direction.destination, stopCount: direction.stops.length, pathPoints: direction.path.length }));

export const fallbackDirectionDetailsFromLine = (line: DashboardData['lines'][number], dayType: ServiceDay, referenceTime: Date | null): LineDirectionDetail[] =>
  buildLineDirections(line).map((direction) => {
    const nextDepartures = buildFallbackNextDepartures(direction, dayType, referenceTime);
    return { id: direction.id, lineId: line.id, lineCode: line.code, lineName: line.name, type: toFallbackDirectionType(direction.id), label: `${direction.origin} -> ${direction.destination}`, routeLabel: direction.routeLabel, origin: direction.origin, destination: direction.destination, mode: line.mode, fareLabel: line.fareLabel, path: direction.path, stops: direction.stops, schedules: direction.schedules, nextDepartures, nextSummary: nextDepartures[0]?.label ?? 'Sem mais saidas hoje', hasDeparturesToday: nextDepartures.length > 0 };
  });
