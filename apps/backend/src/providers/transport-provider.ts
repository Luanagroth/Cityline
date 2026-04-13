import { fallbackLines, type ScheduleEntry, type ServiceDay, type TransportLine } from '@cityline/shared';
import { z } from 'zod';

const createSchedules = (times: string[], dayType: ServiceDay): ScheduleEntry[] =>
  [...new Set(times)].map((time, index) => ({
    id: `${dayType}-${time}`,
    time,
    dayType,
    isPeak: ['06', '07', '08', '17', '18'].some((prefix) => time.startsWith(prefix)),
    occupancy: index < 2 ? 'high' : index < 5 ? 'medium' : 'low',
    platform: `P${(index % 3) + 1}`,
  }));

const cloneLines = (): TransportLine[] =>
  fallbackLines.map((line) => ({
    ...line,
    amenities: [...line.amenities],
    path: line.path.map((point) => ({ ...point })),
    stops: line.stops.map((stop) => ({ ...stop, location: { ...stop.location } })),
    schedules: {
      weekday: line.schedules.weekday.map((item) => ({ ...item })),
      saturday: line.schedules.saturday.map((item) => ({ ...item })),
      sunday: line.schedules.sunday.map((item) => ({ ...item })),
    },
  }));

const extractTimes = (content: string) => [...new Set([...content.matchAll(/\b\d{2}:\d{2}\b/g)].map((match) => match[0]))];

const pickSection = (content: string, marker: string) => {
  const normalized = content.replace(/\s+/g, ' ');
  const index = normalized.toLowerCase().indexOf(marker.toLowerCase());

  if (index < 0) {
    return '';
  }

  return normalized.slice(index, index + 1200);
};

const pointSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

const stopSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  sequence: z.coerce.number(),
  location: pointSchema,
});

const toSchedule = (dayType: ServiceDay) =>
  z
    .object({
      id: z.coerce.string().optional(),
      time: z.string(),
      dayType: z.enum(['weekday', 'saturday', 'sunday']).optional(),
      isPeak: z.boolean().optional(),
      occupancy: z.enum(['low', 'medium', 'high']).optional(),
      platform: z.string().optional(),
    })
    .transform((item): ScheduleEntry => ({
      id: item.id ?? `${dayType}-${item.time}`,
      time: item.time,
      dayType: item.dayType ?? dayType,
      isPeak: item.isPeak ?? ['06', '07', '08', '17', '18'].some((prefix) => item.time.startsWith(prefix)),
      occupancy: item.occupancy ?? 'medium',
      platform: item.platform,
    }));

const lineSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  code: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  operator: z.string().optional(),
  routeLabel: z.string().optional(),
  summary: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  estimatedDurationMinutes: z.coerce.number().optional(),
  distanceKm: z.coerce.number().optional(),
  color: z.string().optional(),
  status: z.enum(['on-time', 'attention', 'reduced']).optional(),
  mode: z.enum(['urban', 'intercity', 'ferry']).optional(),
  fareLabel: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  updatedAt: z.string().optional(),
  stops: z.array(stopSchema).optional(),
  path: z.array(pointSchema).optional(),
  schedules: z.object({
    weekday: z.array(toSchedule('weekday')).optional(),
    saturday: z.array(toSchedule('saturday')).optional(),
    sunday: z.array(toSchedule('sunday')).optional(),
  }).optional(),
});

export interface TransportProvider {
  readonly source: 'external' | 'fallback';
  getLines(): Promise<TransportLine[]>;
}

export class LocalTransportProvider implements TransportProvider {
  readonly source = 'fallback' as const;

  async getLines(): Promise<TransportLine[]> {
    return fallbackLines;
  }
}

export class PublicSourcesTransportProvider implements TransportProvider {
  readonly source = 'external' as const;

  async getLines(): Promise<TransportLine[]> {
    const lines = cloneLines();

    try {
      const response = await fetch('https://portalsaochicoturismo.com.br/ferry-boat/', {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'CityLine/2.0',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const laranjeirasSection = pickSection(html, 'Ferry Boat Laranjeira');
        const joinvilleSection = pickSection(html, 'Ferry Boat Joinville');
        const laranjeirasTimes = extractTimes(laranjeirasSection);
        const joinvilleTimes = extractTimes(joinvilleSection);

        const ferryLaranjeiras = lines.find((line) => line.id === 'ferry-01');
        const ferryJoinville = lines.find((line) => line.id === 'ferry-02');

        if (ferryLaranjeiras && laranjeirasTimes.length) {
          ferryLaranjeiras.schedules = {
            weekday: createSchedules(laranjeirasTimes, 'weekday'),
            saturday: createSchedules(laranjeirasTimes, 'saturday'),
            sunday: createSchedules(laranjeirasTimes, 'sunday'),
          };
          ferryLaranjeiras.summary = 'Horários públicos integrados a partir da página de travessia da Babitonga.';
        }

        if (ferryJoinville && joinvilleTimes.length) {
          ferryJoinville.schedules = {
            weekday: createSchedules(joinvilleTimes, 'weekday'),
            saturday: createSchedules(joinvilleTimes.slice(0, 18), 'saturday'),
            sunday: createSchedules(joinvilleTimes.slice(2), 'sunday'),
          };
          ferryJoinville.summary = 'Horários públicos integrados a partir da travessia Joinville ↔ Vila da Glória.';
        }
      }
    } catch (error) {
      console.warn('Não foi possível consultar as fontes públicas em tempo real. Mantendo fallback local.', error);
    }

    return lines;
  }
}

export class ExternalTransportProvider implements TransportProvider {
  readonly source = 'external' as const;

  constructor(private readonly baseUrl: string) {}

  async getLines(): Promise<TransportLine[]> {
    const endpoint = this.baseUrl.endsWith('/lines') ? this.baseUrl : `${this.baseUrl.replace(/\/$/, '')}/lines`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CityLine/2.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar integração externa: ${response.status}`);
    }

    const payload = await response.json() as unknown;
    const rawLines = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : null;

    if (!rawLines) {
      throw new Error('Formato inválido de integração externa.');
    }

    return rawLines.map((line) => {
      const parsed = lineSchema.parse(line);
      return {
        id: parsed.id,
        code: parsed.code,
        name: parsed.name,
        operator: parsed.operator ?? 'Operador externo',
        routeLabel: parsed.routeLabel ?? `${parsed.origin ?? 'Origem'} → ${parsed.destination ?? 'Destino'}`,
        summary: parsed.summary ?? 'Linha integrada por provedor externo.',
        origin: parsed.origin ?? 'Origem não informada',
        destination: parsed.destination ?? 'Destino não informado',
        estimatedDurationMinutes: parsed.estimatedDurationMinutes ?? 0,
        distanceKm: parsed.distanceKm ?? 0,
        color: parsed.color ?? '#2563eb',
        status: parsed.status ?? 'attention',
        mode: parsed.mode,
        fareLabel: parsed.fareLabel,
        amenities: parsed.amenities ?? [],
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
        stops: parsed.stops ?? [],
        path: parsed.path ?? [],
        schedules: {
          weekday: parsed.schedules?.weekday ?? [],
          saturday: parsed.schedules?.saturday ?? [],
          sunday: parsed.schedules?.sunday ?? [],
        },
      } satisfies TransportLine;
    });
  }
}
