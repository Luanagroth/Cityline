import {
  buildLineDirections as buildSharedLineDirections,
  differenceInMinutes,
  inferServiceDay,
  selectUpcomingSchedulesForDay,
  type GeoPoint,
  type LineStatus,
  type ScheduleEntry,
  type ServiceDay,
  type StopPoint,
  type TransportLine,
  type TransportMode,
} from '@cityline/shared';

export const getActiveDayType = (date = new Date()): ServiceDay => inferServiceDay(date);

export const filterLinesByQuery = (lines: TransportLine[], query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return lines;

  return lines.filter((line) =>
    [line.code, line.name, line.routeLabel, line.summary, line.origin, line.destination, line.mode ?? '', line.fareLabel ?? '', line.amenities.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  );
};

export const transportModeLabel: Record<TransportMode, string> = {
  urban: 'Urbano',
  intercity: 'Intermunicipal',
  ferry: 'Ferry boat',
};

export interface NearestStopMatch {
  stopId: string;
  stopName: string;
  location: GeoPoint;
  distanceMeters: number;
  lines: Array<Pick<TransportLine, 'id' | 'code' | 'name' | 'color' | 'mode' | 'origin' | 'destination'>>;
}

export interface DepartureTimingInfo {
  label: string;
  minutesUntil: number;
  status: 'past' | 'now' | 'soon' | 'upcoming';
}

export interface LineDirectionView {
  id: string;
  label: string;
  origin: string;
  destination: string;
  routeLabel: string;
  path: GeoPoint[];
  stops: StopPoint[];
  schedules: Record<ServiceDay, ScheduleEntry[]>;
}

export interface DirectionNearestStopMatch {
  stopId: string;
  stopName: string;
  location: GeoPoint;
  distanceMeters: number;
  walkingMinutes: number;
  sequence: number;
}

export interface DirectionBoardingRecommendation extends DirectionNearestStopMatch {
  recommendedStopId: string;
  nextDepartureTime?: string;
  nextDepartureLabel?: string;
  nextDepartureMinutes?: number;
  canMakeIt: boolean;
  shouldHurry: boolean;
  reason: 'operational' | 'nearest-fallback' | 'insufficient-data';
  message: string;
}

const WALKING_MARGIN_MINUTES = 2;
const DIRECTION_SEQUENCE_PENALTY = 60;

const toRadians = (value: number) => (value * Math.PI) / 180;

const getNearestRouteDistance = (userLocation: GeoPoint, line: TransportLine) =>
  [line.path[0], ...line.path, line.path.at(-1)]
    .filter((point): point is GeoPoint => Boolean(point))
    .reduce((nearest, point) => Math.min(nearest, getDistanceInMeters(userLocation, point)), Number.POSITIVE_INFINITY);

export const getDistanceInMeters = (from: GeoPoint, to: GeoPoint) => {
  const earthRadius = 6371_000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (distanceMeters: number) => {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

export const estimateWalkingMinutes = (distanceMeters: number, metersPerMinute = 80) => {
  if (distanceMeters <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(distanceMeters / metersPerMinute));
};

export const buildLineDirections = (line: TransportLine): LineDirectionView[] => buildSharedLineDirections(line);

export const findNearestStops = (lines: TransportLine[], userLocation: GeoPoint, limit = 3): NearestStopMatch[] => {
  const stopMap = new Map<string, NearestStopMatch>();

  for (const line of lines) {
    const routeDistanceMeters = getNearestRouteDistance(userLocation, line);

    for (const stop of line.stops) {
      const key = `${stop.name}-${stop.location.lat.toFixed(4)}-${stop.location.lng.toFixed(4)}`;
      const stopDistanceMeters = getDistanceInMeters(userLocation, stop.location);
      const rankingDistance = Math.min(stopDistanceMeters, routeDistanceMeters + 120);
      const existing = stopMap.get(key);
      const lineSummary = {
        id: line.id,
        code: line.code,
        name: line.name,
        color: line.color,
        mode: line.mode,
        origin: line.origin,
        destination: line.destination,
      };

      if (existing) {
        if (!existing.lines.some((entry) => entry.id === line.id)) {
          existing.lines.push(lineSummary);
        }
        existing.distanceMeters = Math.min(existing.distanceMeters, rankingDistance);
      } else {
        stopMap.set(key, {
          stopId: stop.id,
          stopName: stop.name,
          location: stop.location,
          distanceMeters: rankingDistance,
          lines: [lineSummary],
        });
      }
    }
  }

  return [...stopMap.values()].sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, limit);
};

export const findNearestStopForDirection = (
  direction: Pick<LineDirectionView, 'stops'> | null,
  userLocation: GeoPoint | null
): DirectionNearestStopMatch | null => {
  if (!direction || !userLocation || !direction.stops.length) {
    return null;
  }

  const bestStop = direction.stops.reduce<{ stop: StopPoint; distanceMeters: number } | null>((nearest, stop) => {
    const distanceMeters = getDistanceInMeters(userLocation, stop.location);

    if (!nearest || distanceMeters < nearest.distanceMeters) {
      return { stop, distanceMeters };
    }

    return nearest;
  }, null);

  if (!bestStop) {
    return null;
  }

  return {
    stopId: bestStop.stop.id,
    stopName: bestStop.stop.name,
    location: bestStop.stop.location,
    distanceMeters: bestStop.distanceMeters,
    walkingMinutes: estimateWalkingMinutes(bestStop.distanceMeters),
    sequence: bestStop.stop.sequence,
  };
};

const buildBoardingRecommendation = (
  base: DirectionNearestStopMatch,
  overrides: Partial<Omit<DirectionBoardingRecommendation, keyof DirectionNearestStopMatch>>
): DirectionBoardingRecommendation => ({
  ...base,
  recommendedStopId: base.stopId,
  canMakeIt: false,
  shouldHurry: false,
  reason: 'nearest-fallback',
  message: 'Mostrando a parada fisicamente mais proxima.',
  ...overrides,
});

export const recommendBoardingStopForDirection = (
  direction: Pick<LineDirectionView, 'stops' | 'schedules'> | null,
  dayType: ServiceDay,
  userLocation: GeoPoint | null,
  reference = new Date()
): DirectionBoardingRecommendation | null => {
  const nearestStop = findNearestStopForDirection(direction, userLocation);

  if (!nearestStop) {
    return null;
  }

  if (!direction || !direction.stops.length || !userLocation) {
    return buildBoardingRecommendation(nearestStop, {
      reason: 'insufficient-data',
      message: 'Dados insuficientes para recomendar um embarque melhor agora.',
    });
  }

  const schedules = direction.schedules?.[dayType] ?? [];

  if (!schedules.length) {
    return buildBoardingRecommendation(nearestStop, {
      reason: 'nearest-fallback',
      message: 'Sem horarios suficientes neste sentido. Mostrando a parada fisicamente mais proxima.',
    });
  }

  const candidates = direction.stops
    .map((stop) => {
      const distanceMeters = getDistanceInMeters(userLocation, stop.location);
      const walkingMinutes = estimateWalkingMinutes(distanceMeters);
      const nextDeparture = schedules
        .map((schedule) => {
          const timing = getDepartureTiming(schedule.time, reference);
          return {
            schedule,
            timing,
          };
        })
        .find((entry) => entry.timing.minutesUntil >= walkingMinutes + WALKING_MARGIN_MINUTES);

      return {
        stop,
        distanceMeters,
        walkingMinutes,
        nextDeparture,
        score: distanceMeters + stop.sequence * DIRECTION_SEQUENCE_PENALTY,
      };
    })
    .sort((left, right) => left.score - right.score);

  const viableCandidate = candidates.find((candidate) => candidate.nextDeparture);

  if (!viableCandidate || !viableCandidate.nextDeparture) {
    const fallbackDeparture = schedules
      .map((schedule) => ({
        schedule,
        timing: getDepartureTiming(schedule.time, reference),
      }))
      .find((entry) => entry.timing.minutesUntil >= 0);

    return buildBoardingRecommendation(nearestStop, {
      nextDepartureTime: fallbackDeparture?.schedule.time,
      nextDepartureLabel: fallbackDeparture?.timing.label,
      nextDepartureMinutes: fallbackDeparture?.timing.minutesUntil,
      reason: 'nearest-fallback',
      message: fallbackDeparture
        ? 'A parada mais proxima nao parece viavel para a proxima saida. Talvez seja melhor aguardar a proxima viagem.'
        : 'Sem saidas uteis agora. Mostrando a parada fisicamente mais proxima.',
    });
  }

  const shouldHurry = viableCandidate.nextDeparture.timing.minutesUntil <= viableCandidate.walkingMinutes + 5;

  return {
    ...nearestStop,
    stopId: viableCandidate.stop.id,
    recommendedStopId: viableCandidate.stop.id,
    stopName: viableCandidate.stop.name,
    location: viableCandidate.stop.location,
    distanceMeters: viableCandidate.distanceMeters,
    walkingMinutes: viableCandidate.walkingMinutes,
    sequence: viableCandidate.stop.sequence,
    nextDepartureTime: viableCandidate.nextDeparture.schedule.time,
    nextDepartureLabel: viableCandidate.nextDeparture.timing.label,
    nextDepartureMinutes: viableCandidate.nextDeparture.timing.minutesUntil,
    canMakeIt: true,
    shouldHurry,
    reason: 'operational',
    message: shouldHurry
      ? 'Melhor parada para embarque agora, mas vale ir sem demora.'
      : 'Melhor parada para embarque agora considerando caminhada e proxima saida.',
  };
};

export const getNextDepartures = (schedules: ScheduleEntry[], reference = new Date(), limit = 3): ScheduleEntry[] =>
  selectUpcomingSchedulesForDay(schedules, reference, limit);

export const getDepartureTiming = (time: string, reference = new Date()): DepartureTimingInfo => {
  const diff = differenceInMinutes(time, reference);

  if (diff < 0) {
    return { label: 'já saiu', minutesUntil: diff, status: 'past' };
  }

  if (diff <= 1) {
    return { label: 'saindo agora', minutesUntil: diff, status: 'now' };
  }

  if (diff < 15) {
    return { label: `partida em ${diff} min`, minutesUntil: diff, status: 'soon' };
  }

  if (diff < 60) {
    return { label: `partida em ${diff} min`, minutesUntil: diff, status: 'upcoming' };
  }

  const fullHours = Math.floor(diff / 60);
  const remainingMinutes = diff % 60;
  const label = remainingMinutes ? `partida em ${fullHours}h ${remainingMinutes}min` : `partida em ${fullHours}h`;

  return { label, minutesUntil: diff, status: 'upcoming' };
};

export const getMinutesUntilDeparture = (time: string, reference = new Date()) => getDepartureTiming(time, reference).label;

export const statusLabel: Record<LineStatus, string> = {
  'on-time': 'Operacao regular',
  attention: 'Atencao operacional',
  reduced: 'Operacao reduzida',
};
