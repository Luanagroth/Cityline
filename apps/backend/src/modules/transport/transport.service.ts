import type { DataSource, ServiceDay, TransportLine, TransportMode } from '@cityline/shared';
import { env } from '../../config/env.js';
import { LocalTransportProvider } from '../../providers/transport-provider.js';
import { AppError } from '../../shared/errors/app-error.js';
import { buildFallbackDirections, mapDirectionRecords, mapTransportLineRecord, type LineDirectionView } from './transport.mapper.js';
import { TransportRepository } from './transport.repository.js';
import { selectNextDepartures } from './transport-schedule.utils.js';

interface CachedState {
  lines: TransportLine[];
  source: DataSource;
  fallback: boolean;
  expiresAt: number;
}

export const filterLines = (lines: TransportLine[], query = ''): TransportLine[] => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return lines;
  }

  return lines.filter((line) =>
    [line.code, line.name, line.routeLabel, line.summary, line.origin, line.destination, line.mode ?? '', line.fareLabel ?? '', line.amenities.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  );
};

const filterByMode = (lines: TransportLine[], mode?: TransportMode) => {
  if (!mode) {
    return lines;
  }

  return lines.filter((line) => (line.mode ?? 'urban') === mode);
};

class TransportService {
  private readonly repository = new TransportRepository();
  private readonly fallbackProvider = new LocalTransportProvider();
  private cache: CachedState | null = null;

  private async loadLines(): Promise<{ lines: TransportLine[]; source: DataSource; fallback: boolean }> {
    const now = Date.now();

    if (this.cache && this.cache.expiresAt > now) {
      return { lines: this.cache.lines, source: this.cache.source, fallback: this.cache.fallback };
    }

    try {
      const records = await this.repository.listLines();

      if (records.length) {
        const lines = records.map(mapTransportLineRecord);
        this.cache = {
          lines,
          source: 'database',
          fallback: false,
          expiresAt: now + env.TRANSPORT_CACHE_TTL_MS,
        };

        return { lines, source: 'database', fallback: false };
      }
    } catch (error) {
      console.warn('Falha ao carregar a malha de transporte via Prisma. Ativando fallback local.', error);
    }

    const lines = await this.fallbackProvider.getLines();
    this.cache = {
      lines,
      source: 'fallback',
      fallback: true,
      expiresAt: now + env.TRANSPORT_CACHE_TTL_MS,
    };

    return { lines, source: 'fallback', fallback: true };
  }

  private async loadDirections(lineId: string): Promise<{
    line: { id: string; code: string; name: string };
    directions: LineDirectionView[];
    source: DataSource;
    fallback: boolean;
  }> {
    try {
      const record = await this.repository.findLineByIdOrCode(lineId);

      if (record) {
        return {
          line: {
            id: record.id,
            code: record.code,
            name: record.name,
          },
          directions: mapDirectionRecords(record),
          source: 'database',
          fallback: false,
        };
      }
    } catch (error) {
      console.warn('Falha ao carregar sentidos via Prisma. Ativando fallback local.', error);
    }

    const lines = await this.fallbackProvider.getLines();
    const line = lines.find((item) => item.id === lineId || item.code === lineId);

    if (!line) {
      throw new AppError(404, 'LINE_NOT_FOUND', 'Linha nao encontrada para o identificador informado.');
    }

    return {
      line: {
        id: line.id,
        code: line.code,
        name: line.name,
      },
      directions: buildFallbackDirections(line),
      source: 'fallback',
      fallback: true,
    };
  }

  private async loadDirection(lineId: string, directionId: string) {
    const payload = await this.loadDirections(lineId);
    const direction = payload.directions.find((item) => item.id === directionId);

    if (!direction) {
      throw new AppError(404, 'DIRECTION_NOT_FOUND', 'Sentido nao encontrado para a linha informada.');
    }

    return {
      ...payload,
      direction,
    };
  }

  async listLines(mode?: TransportMode) {
    const { lines, source, fallback } = await this.loadLines();
    const scoped = filterByMode(lines, mode);
    return { data: scoped, meta: { source, fallback, count: scoped.length } };
  }

  async getLineById(lineId: string) {
    const { lines, source, fallback } = await this.loadLines();
    const line = lines.find((item) => item.id === lineId || item.code === lineId);

    if (!line) {
      throw new AppError(404, 'LINE_NOT_FOUND', 'Linha não encontrada para o identificador informado.');
    }

    return { data: line, meta: { source, fallback, count: 1 } };
  }

  async getSchedules(lineId?: string, dayType: ServiceDay = 'weekday', mode?: TransportMode) {
    const { lines, source, fallback } = await this.loadLines();
    const scopedLines = filterByMode(lines, mode);

    if (lineId) {
      const line = scopedLines.find((item) => item.id === lineId || item.code === lineId);

      if (!line) {
        throw new AppError(404, 'LINE_NOT_FOUND', 'Linha não encontrada para consulta de horários.');
      }

      return {
        data: {
          lineId: line.id,
          lineCode: line.code,
          lineName: line.name,
          dayType,
          items: line.schedules[dayType],
        },
        meta: { source, fallback, count: line.schedules[dayType].length },
      };
    }

    const items = scopedLines.map((line) => ({
      lineId: line.id,
      lineCode: line.code,
      lineName: line.name,
      dayType,
      items: line.schedules[dayType],
    }));

    return {
      data: items,
      meta: { source, fallback, count: items.length },
    };
  }

  async searchLines(query: string, mode?: TransportMode) {
    const { lines, source, fallback } = await this.loadLines();
    const result = filterByMode(filterLines(lines, query), mode);

    return {
      data: result,
      meta: { source, fallback, count: result.length, query },
    };
  }

  async getMapLines(mode?: TransportMode) {
    const { lines, source, fallback } = await this.loadLines();
    const scopedLines = filterByMode(lines, mode);

    return {
      data: scopedLines.map((line) => ({
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
      })),
      meta: { source, fallback, count: scopedLines.length },
    };
  }

  async listDirections(lineId: string) {
    const { line, directions, source, fallback } = await this.loadDirections(lineId);

    return {
      data: directions.map((direction) => ({
        id: direction.id,
        lineId: direction.lineId,
        lineCode: direction.lineCode,
        lineName: direction.lineName,
        type: direction.type,
        label: direction.label,
        routeLabel: direction.routeLabel,
        origin: direction.origin,
        destination: direction.destination,
        stopCount: direction.stops.length,
        pathPoints: direction.path.length,
      })),
      meta: { source, fallback, count: directions.length },
      line,
    };
  }

  async getDirectionStops(lineId: string, directionId: string) {
    const { line, direction, source, fallback } = await this.loadDirection(lineId, directionId);

    return {
      data: {
        lineId: line.id,
        lineCode: line.code,
        lineName: line.name,
        direction: {
          id: direction.id,
          type: direction.type,
          label: direction.label,
          routeLabel: direction.routeLabel,
          origin: direction.origin,
          destination: direction.destination,
        },
        items: direction.stops,
      },
      meta: { source, fallback, count: direction.stops.length },
    };
  }

  async getDirectionSchedules(lineId: string, directionId: string, dayType: ServiceDay, reference = new Date(), limit = 3) {
    const { line, direction, source, fallback } = await this.loadDirection(lineId, directionId);
    const nextDepartures = selectNextDepartures(direction.schedules, dayType, reference, limit);

    return {
      data: {
        lineId: line.id,
        lineCode: line.code,
        lineName: line.name,
        direction: {
          id: direction.id,
          type: direction.type,
          label: direction.label,
          routeLabel: direction.routeLabel,
          origin: direction.origin,
          destination: direction.destination,
        },
        dayType,
        items: direction.schedules[dayType],
        nextDepartures: nextDepartures.items,
        summary: nextDepartures.summary,
        hasDeparturesToday: nextDepartures.hasDeparturesToday,
      },
      meta: { source, fallback, count: direction.schedules[dayType].length },
    };
  }

  async getDirectionPath(lineId: string, directionId: string) {
    const { line, direction, source, fallback } = await this.loadDirection(lineId, directionId);

    return {
      data: {
        lineId: line.id,
        lineCode: line.code,
        lineName: line.name,
        direction: {
          id: direction.id,
          type: direction.type,
          label: direction.label,
          routeLabel: direction.routeLabel,
          origin: direction.origin,
          destination: direction.destination,
        },
        path: direction.path,
      },
      meta: { source, fallback, count: direction.path.length },
    };
  }
}

export const transportService = new TransportService();
