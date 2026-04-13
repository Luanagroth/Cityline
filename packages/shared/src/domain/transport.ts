import type { ScheduleEntry, ServiceDay, StopPoint, TransportLine } from '../types/transport.js';

const DAY_TYPES: ServiceDay[] = ['weekday', 'saturday', 'sunday'];

export interface CanonicalLineDirection {
  id: string;
  type: 'outbound' | 'inbound';
  label: string;
  routeLabel: string;
  origin: string;
  destination: string;
  path: TransportLine['path'];
  stops: StopPoint[];
  schedules: Record<ServiceDay, ScheduleEntry[]>;
}

export interface BuildLineDirectionsOptions {
  outboundId?: string;
  inboundId?: string;
  inboundOffsetMinutes?: number;
  inboundRouteLabel?: string;
  inboundScheduleTag?: string;
  inboundStopIdSuffix?: string;
}

export interface UpcomingScheduleWindowItem {
  schedule: ScheduleEntry;
  dayType: ServiceDay;
  minutesUntil: number;
  isTomorrow: boolean;
}

export interface UpcomingScheduleWindow {
  items: UpcomingScheduleWindowItem[];
  hasDeparturesToday: boolean;
}

export const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

export const differenceInMinutes = (targetTime: string, reference: Date) =>
  parseTimeToMinutes(targetTime) - (reference.getHours() * 60 + reference.getMinutes());

export const inferServiceDay = (date: Date): ServiceDay => {
  const day = date.getDay();

  if (day === 0) {
    return 'sunday';
  }

  if (day === 6) {
    return 'saturday';
  }

  return 'weekday';
};

export const shiftTimeByMinutes = (time: string, minutesToAdd: number) => {
  const totalMinutes = ((parseTimeToMinutes(time) + minutesToAdd) % 1440 + 1440) % 1440;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const shiftSchedulesByMinutes = (
  schedules: Record<ServiceDay, ScheduleEntry[]>,
  offsetMinutes: number,
  scheduleTag = 'inbound'
) => {
  return Object.fromEntries(
    DAY_TYPES.map((dayType) => [
      dayType,
      schedules[dayType].map((schedule, index) => ({
        ...schedule,
        id: `${schedule.id}-${scheduleTag}-${index}`,
        time: shiftTimeByMinutes(schedule.time, offsetMinutes),
      })),
    ])
  ) as Record<ServiceDay, ScheduleEntry[]>;
};

export const reverseStops = (stops: StopPoint[], stopIdSuffix = '-inbound') =>
  [...stops].reverse().map((stop, index) => ({
    ...stop,
    id: stopIdSuffix ? `${stop.id}${stopIdSuffix}` : stop.id,
    sequence: index + 1,
  }));

export const inferInboundOffset = (line: Pick<TransportLine, 'estimatedDurationMinutes' | 'mode'>, configuredOffset?: number) => {
  if (typeof configuredOffset === 'number') {
    return configuredOffset;
  }

  if (line.mode === 'ferry') {
    return 0;
  }

  return Math.max(12, line.estimatedDurationMinutes + 6);
};

export const buildLineDirections = (
  line: TransportLine,
  options: BuildLineDirectionsOptions = {}
): CanonicalLineDirection[] => {
  const inboundOffsetMinutes = inferInboundOffset(line, options.inboundOffsetMinutes);
  const inboundRouteLabel = options.inboundRouteLabel ?? `${line.destination} -> ${line.origin}`;

  return [
    {
      id: options.outboundId ?? `${line.id}-outbound`,
      type: 'outbound',
      label: `${line.origin} -> ${line.destination}`,
      routeLabel: line.routeLabel,
      origin: line.origin,
      destination: line.destination,
      path: line.path,
      stops: line.stops,
      schedules: line.schedules,
    },
    {
      id: options.inboundId ?? `${line.id}-inbound`,
      type: 'inbound',
      label: `${line.destination} -> ${line.origin}`,
      routeLabel: inboundRouteLabel,
      origin: line.destination,
      destination: line.origin,
      path: [...line.path].reverse(),
      stops: reverseStops(line.stops, options.inboundStopIdSuffix),
      schedules: shiftSchedulesByMinutes(line.schedules, inboundOffsetMinutes, options.inboundScheduleTag),
    },
  ];
};

export const selectUpcomingSchedulesForDay = (schedules: ScheduleEntry[], reference = new Date(), limit = 3): ScheduleEntry[] => {
  const upcoming = schedules.filter((schedule) => differenceInMinutes(schedule.time, reference) >= 0);
  return (upcoming.length ? upcoming : schedules).slice(0, limit);
};

export const selectUpcomingSchedulesAcrossDays = (
  schedules: Record<ServiceDay, ScheduleEntry[]>,
  dayType: ServiceDay,
  reference = new Date(),
  limit = 3
): UpcomingScheduleWindow => {
  const todayItems = [...schedules[dayType]]
    .sort((left, right) => parseTimeToMinutes(left.time) - parseTimeToMinutes(right.time))
    .filter((item) => differenceInMinutes(item.time, reference) >= 0);

  if (todayItems.length) {
    return {
      items: todayItems.slice(0, limit).map((schedule) => ({
        schedule,
        dayType,
        minutesUntil: differenceInMinutes(schedule.time, reference),
        isTomorrow: false,
      })),
      hasDeparturesToday: true,
    };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const candidateDate = new Date(reference);
    candidateDate.setDate(reference.getDate() + offset);
    const nextDayType = inferServiceDay(candidateDate);
    const nextItems = [...schedules[nextDayType]].sort((left, right) => parseTimeToMinutes(left.time) - parseTimeToMinutes(right.time));

    if (!nextItems.length) {
      continue;
    }

    return {
      items: nextItems.slice(0, limit).map((schedule) => ({
        schedule,
        dayType: nextDayType,
        minutesUntil: differenceInMinutes(schedule.time, reference) + offset * 24 * 60,
        isTomorrow: offset === 1,
      })),
      hasDeparturesToday: false,
    };
  }

  return {
    items: [],
    hasDeparturesToday: false,
  };
};
