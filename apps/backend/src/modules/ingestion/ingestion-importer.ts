import {
  DirectionType,
  LineOperationalStatus,
  OccupancyLevel as PrismaOccupancyLevel,
  Prisma,
  ServiceDayType,
  TransportMode as PrismaTransportMode,
} from '@prisma/client';
import type {
  FerryFare,
  FerrySchedule,
  NormalizedFare,
  NormalizedRouteDirection,
  NormalizedRoutePath,
  NormalizedSchedule,
  NormalizedStop,
  NormalizedTransportDataset,
  NormalizedTransportLine,
  StopTimePrediction,
} from '@cityline/shared';
import { prisma } from '../../shared/database/prisma.js';
import { normalizedTransportDatasetSchema } from './ingestion.schemas.js';

type PersistedSchedule = NormalizedSchedule;

interface StopTimePredictionCreateManyInput {
  id: string;
  scheduleId: string;
  lineStopId: string;
  serviceDay: ServiceDayType;
  predictedTime: string;
  predictedMinutes: number;
  sourceConfidence?: string;
  sourceCollectedAt?: Date;
  note?: string;
}

interface NormalizedImportPlan {
  datasetId: string;
  lineIds: string[];
  directionIds: string[];
  stopIds: string[];
  transportLines: NormalizedTransportLine[];
  routeDirections: NormalizedRouteDirection[];
  stops: NormalizedStop[];
  lineStops: NormalizedTransportDataset['lineStops'];
  schedules: PersistedSchedule[];
  stopTimePredictions: StopTimePrediction[];
  routePaths: NormalizedRoutePath[];
  fares: NormalizedFare[];
}

export interface NormalizedImportResult {
  datasetId: string;
  importedAt: string;
  lineIds: string[];
  created: {
    transportLines: number;
    stops: number;
  };
  updated: {
    transportLines: number;
    stops: number;
  };
  counts: {
    transportLines: number;
    routeDirections: number;
    stops: number;
    lineStops: number;
    schedules: number;
    stopTimePredictions: number;
    routePaths: number;
    fares: number;
  };
}

interface IngestionTransactionClient {
  transportLine: {
    findMany(args: {
      where: Prisma.TransportLineWhereInput;
      select: { id: true; code?: true; transportMode?: true };
    }): Promise<Array<{ id: string; code?: string; transportMode?: PrismaTransportMode }>>;
    upsert(args: {
      where: Prisma.TransportLineWhereUniqueInput;
      create: Prisma.TransportLineUncheckedCreateInput;
      update: Prisma.TransportLineUncheckedUpdateInput;
    }): Promise<unknown>;
  };
  stop: {
    findMany(args: {
      where: Prisma.StopWhereInput;
      select: { id: true };
    }): Promise<Array<{ id: string }>>;
    upsert(args: {
      where: Prisma.StopWhereUniqueInput;
      create: Prisma.StopUncheckedCreateInput;
      update: Prisma.StopUncheckedUpdateInput;
    }): Promise<unknown>;
  };
  fare: {
    deleteMany(args: { where: Prisma.FareWhereInput }): Promise<unknown>;
    createMany(args: { data: Prisma.FareCreateManyInput[] }): Promise<unknown>;
  };
  routeDirection: {
    deleteMany(args: { where: Prisma.RouteDirectionWhereInput }): Promise<unknown>;
    createMany(args: { data: Prisma.RouteDirectionCreateManyInput[] }): Promise<unknown>;
  };
  lineStop: {
    createMany(args: { data: Prisma.LineStopCreateManyInput[] }): Promise<unknown>;
  };
  schedule: {
    createMany(args: { data: Prisma.ScheduleCreateManyInput[] }): Promise<unknown>;
  };
  stopTimePrediction: {
    createMany(args: { data: StopTimePredictionCreateManyInput[] }): Promise<unknown>;
  };
  routePath: {
    createMany(args: { data: Prisma.RoutePathCreateManyInput[] }): Promise<unknown>;
  };
}

interface IngestionDatabaseClient extends IngestionTransactionClient {
  $transaction<T>(callback: (transaction: IngestionTransactionClient) => Promise<T>): Promise<T>;
}

const toPrismaTransportMode = (mode: NormalizedTransportLine['transportMode']) => {
  switch (mode) {
    case 'intermunicipal':
      return PrismaTransportMode.INTERMUNICIPAL;
    case 'ferry':
      return PrismaTransportMode.FERRY;
    case 'municipal':
    default:
      return PrismaTransportMode.MUNICIPAL;
  }
};

const buildModeCodeKey = (transportMode: PrismaTransportMode, code: string) => `${transportMode}:${code}`;

const toPrismaDirectionType = (type: NormalizedRouteDirection['type']) => {
  switch (type) {
    case 'inbound':
      return DirectionType.INBOUND;
    case 'outbound':
    default:
      return DirectionType.OUTBOUND;
  }
};

const toPrismaServiceDay = (serviceDay: PersistedSchedule['serviceDay'] | StopTimePrediction['serviceDay']) => {
  switch (serviceDay) {
    case 'saturday':
      return ServiceDayType.SATURDAY;
    case 'sunday':
      return ServiceDayType.SUNDAY;
    case 'weekday':
    default:
      return ServiceDayType.WEEKDAY;
  }
};

const toPrismaOccupancy = (occupancy: PersistedSchedule['occupancy']) => {
  switch (occupancy) {
    case 'low':
      return PrismaOccupancyLevel.LOW;
    case 'high':
      return PrismaOccupancyLevel.HIGH;
    case 'medium':
    default:
      return PrismaOccupancyLevel.MEDIUM;
  }
};

const toPrismaOperationalStatus = (status: NormalizedTransportLine['operationalStatus']) => {
  switch (status) {
    case 'attention':
      return LineOperationalStatus.ATTENTION;
    case 'reduced':
      return LineOperationalStatus.REDUCED;
    case 'on-time':
    default:
      return LineOperationalStatus.ON_TIME;
  }
};

const isPeakTime = (time: string) => ['06', '07', '08', '17', '18'].some((prefix) => time.startsWith(prefix));

const uniqueById = <T extends { id: string }>(items: T[]) => [...new Map(items.map((item) => [item.id, item])).values()];

const mergePersistedSchedules = (
  schedules: NormalizedSchedule[],
  ferrySchedules: FerrySchedule[]
): PersistedSchedule[] =>
  uniqueById([
    ...schedules,
    ...ferrySchedules.map<PersistedSchedule>((schedule) => ({
      id: schedule.id,
      directionId: schedule.directionId,
      serviceDay: schedule.serviceDay,
      departureTime: schedule.departureTime,
      departureMinutes: schedule.departureMinutes,
      isPeak: isPeakTime(schedule.departureTime),
      occupancy: 'medium',
      platform: schedule.platform,
      note: schedule.note,
    })),
  ]);

const mergePersistedFares = (fares: NormalizedFare[], ferryFares: FerryFare[]) => uniqueById([...fares, ...ferryFares]);

const assertReferenceIntegrity = (dataset: NormalizedTransportDataset, schedules: PersistedSchedule[], fares: NormalizedFare[]) => {
  const lineIds = new Set(dataset.transportLines.map((line) => line.id));
  const directionIds = new Set(dataset.routeDirections.map((direction) => direction.id));
  const stopIds = new Set(dataset.stops.map((stop) => stop.id));
  const lineStopIds = new Set(dataset.lineStops.map((lineStop) => lineStop.id));
  const scheduleIds = new Set(schedules.map((schedule) => schedule.id));

  for (const direction of dataset.routeDirections) {
    if (!lineIds.has(direction.lineId)) {
      throw new Error(`Direction ${direction.id} referencia a linha inexistente ${direction.lineId}.`);
    }
  }

  for (const lineStop of dataset.lineStops) {
    if (!directionIds.has(lineStop.directionId)) {
      throw new Error(`LineStop ${lineStop.id} referencia directionId inexistente ${lineStop.directionId}.`);
    }
    if (!stopIds.has(lineStop.stopId)) {
      throw new Error(`LineStop ${lineStop.id} referencia stopId inexistente ${lineStop.stopId}.`);
    }
  }

  for (const schedule of schedules) {
    if (!directionIds.has(schedule.directionId)) {
      throw new Error(`Schedule ${schedule.id} referencia directionId inexistente ${schedule.directionId}.`);
    }
  }

  for (const prediction of dataset.stopTimePredictions) {
    if (!scheduleIds.has(prediction.scheduleId)) {
      throw new Error(`StopTimePrediction ${prediction.id} referencia scheduleId inexistente ${prediction.scheduleId}.`);
    }
    if (!lineStopIds.has(prediction.lineStopId)) {
      throw new Error(`StopTimePrediction ${prediction.id} referencia lineStopId inexistente ${prediction.lineStopId}.`);
    }
  }

  for (const routePath of dataset.routePaths) {
    if (!directionIds.has(routePath.directionId)) {
      throw new Error(`RoutePath ${routePath.id} referencia directionId inexistente ${routePath.directionId}.`);
    }
  }

  for (const fare of fares) {
    if (!lineIds.has(fare.lineId)) {
      throw new Error(`Fare ${fare.id} referencia lineId inexistente ${fare.lineId}.`);
    }
  }
};

export const buildNormalizedImportPlan = (input: NormalizedTransportDataset): NormalizedImportPlan => {
  const dataset = normalizedTransportDatasetSchema.parse(input);
  const schedules = mergePersistedSchedules(dataset.schedules, dataset.ferrySchedules);
  const fares = mergePersistedFares(dataset.fares, dataset.ferryFares);

  assertReferenceIntegrity(dataset, schedules, fares);

  return {
    datasetId: dataset.metadata.datasetId,
    lineIds: dataset.transportLines.map((line) => line.id),
    directionIds: dataset.routeDirections.map((direction) => direction.id),
    stopIds: dataset.stops.map((stop) => stop.id),
    transportLines: dataset.transportLines,
    routeDirections: dataset.routeDirections,
    stops: dataset.stops,
    lineStops: dataset.lineStops,
    schedules,
    stopTimePredictions: dataset.stopTimePredictions,
    routePaths: dataset.routePaths,
    fares,
  };
};

const createManyIfAny = async <T>(
  delegate: { createMany(args: { data: T[] }): Promise<unknown> },
  data: T[]
) => {
  if (data.length === 0) {
    return;
  }

  await delegate.createMany({ data });
};

const upsertTransportLine = (transaction: IngestionTransactionClient, line: NormalizedTransportLine) =>
  transaction.transportLine.upsert({
    where: { id: line.id },
    create: {
      id: line.id,
      code: line.code,
      slug: line.slug,
      name: line.name,
      operator: line.operator,
      summary: line.summary,
      routeLabel: line.routeLabel,
      originLabel: line.originLabel,
      destinationLabel: line.destinationLabel,
      transportMode: toPrismaTransportMode(line.transportMode),
      operationalStatus: toPrismaOperationalStatus(line.operationalStatus),
      estimatedDurationMinutes: line.estimatedDurationMinutes,
      distanceKm: line.distanceKm,
      fareSummary: line.fareSummary,
      color: line.color,
      amenities: JSON.stringify(line.amenities),
      sourceUpdatedAt: line.sourceUpdatedAt ? new Date(line.sourceUpdatedAt) : undefined,
      isActive: line.isActive,
    },
    update: {
      code: line.code,
      slug: line.slug,
      name: line.name,
      operator: line.operator,
      summary: line.summary,
      routeLabel: line.routeLabel,
      originLabel: line.originLabel,
      destinationLabel: line.destinationLabel,
      transportMode: toPrismaTransportMode(line.transportMode),
      operationalStatus: toPrismaOperationalStatus(line.operationalStatus),
      estimatedDurationMinutes: line.estimatedDurationMinutes,
      distanceKm: line.distanceKm,
      fareSummary: line.fareSummary,
      color: line.color,
      amenities: JSON.stringify(line.amenities),
      sourceUpdatedAt: line.sourceUpdatedAt ? new Date(line.sourceUpdatedAt) : null,
      isActive: line.isActive,
    },
  });

const upsertStop = (transaction: IngestionTransactionClient, stop: NormalizedStop) =>
  transaction.stop.upsert({
    where: { id: stop.id },
    create: {
      id: stop.id,
      name: stop.name,
      slug: stop.slug,
      latitude: stop.latitude,
      longitude: stop.longitude,
      description: stop.description,
    },
    update: {
      name: stop.name,
      slug: stop.slug,
      latitude: stop.latitude,
      longitude: stop.longitude,
      description: stop.description ?? null,
    },
  });

export class NormalizedDatasetImporter {
  constructor(private readonly database: IngestionDatabaseClient = prisma as unknown as IngestionDatabaseClient) {}

  async importDataset(input: NormalizedTransportDataset): Promise<NormalizedImportResult> {
    const plan = buildNormalizedImportPlan(input);
    const existingLines = await this.database.transportLine.findMany({
      where: {
        OR: [
          {
            id: {
              in: plan.lineIds,
            },
          },
          ...plan.transportLines.map((line) => ({
            transportMode: toPrismaTransportMode(line.transportMode),
            code: line.code,
          })),
        ],
      },
      select: {
        id: true,
        code: true,
        transportMode: true,
      },
    });
    const existingStops = await this.database.stop.findMany({
      where: {
        id: {
          in: plan.stopIds,
        },
      },
      select: {
        id: true,
      },
    });
    const existingLineIds = new Set(existingLines.map((item) => item.id));
    const existingStopIds = new Set(existingStops.map((item) => item.id));
    const existingLinesByModeAndCode = new Map(
      existingLines
        .filter((item): item is { id: string; code: string; transportMode: PrismaTransportMode } => Boolean(item.code && item.transportMode))
        .map((item) => [buildModeCodeKey(item.transportMode, item.code), item.id])
    );

    for (const line of plan.transportLines) {
      const modeAndCodeKey = buildModeCodeKey(toPrismaTransportMode(line.transportMode), line.code);
      const existingIdForModeAndCode = existingLinesByModeAndCode.get(modeAndCodeKey);

      if (existingIdForModeAndCode && existingIdForModeAndCode !== line.id) {
        throw new Error(
          `Conflito de identidade para linha ${line.code} (${line.transportMode}). O banco ja possui id ${existingIdForModeAndCode} para o mesmo par mode+code, mas o manifest trouxe ${line.id}.`
        );
      }
    }

    await this.database.$transaction(async (transaction) => {
      for (const line of plan.transportLines) {
        await upsertTransportLine(transaction, line);
      }

      for (const stop of plan.stops) {
        await upsertStop(transaction, stop);
      }

      await transaction.fare.deleteMany({
        where: {
          lineId: {
            in: plan.lineIds,
          },
        },
      });

      await transaction.routeDirection.deleteMany({
        where: {
          lineId: {
            in: plan.lineIds,
          },
        },
      });

      await createManyIfAny(
        transaction.routeDirection,
        plan.routeDirections.map<Prisma.RouteDirectionCreateManyInput>((direction) => ({
          id: direction.id,
          lineId: direction.lineId,
          type: toPrismaDirectionType(direction.type),
          slug: direction.slug,
          name: direction.name,
          routeLabel: direction.routeLabel,
          originLabel: direction.originLabel,
          destinationLabel: direction.destinationLabel,
          sortOrder: direction.sortOrder,
          isLoop: direction.isLoop,
        }))
      );

      await createManyIfAny(
        transaction.lineStop,
        plan.lineStops.map<Prisma.LineStopCreateManyInput>((lineStop) => ({
          id: lineStop.id,
          directionId: lineStop.directionId,
          stopId: lineStop.stopId,
          sequence: lineStop.sequence,
          distanceFromStartKm: lineStop.distanceFromStartKm,
          platform: lineStop.platform,
          isTimingPoint: lineStop.isTimingPoint,
        }))
      );

      await createManyIfAny(
        transaction.schedule,
        plan.schedules.map<Prisma.ScheduleCreateManyInput>((schedule) => ({
          id: schedule.id,
          directionId: schedule.directionId,
          serviceDay: toPrismaServiceDay(schedule.serviceDay),
          departureTime: schedule.departureTime,
          departureMinutes: schedule.departureMinutes,
          isPeak: schedule.isPeak,
          occupancy: toPrismaOccupancy(schedule.occupancy),
          platform: schedule.platform,
          note: schedule.note,
        }))
      );

      await createManyIfAny(
        transaction.stopTimePrediction,
        plan.stopTimePredictions.map<StopTimePredictionCreateManyInput>((prediction) => ({
          id: prediction.id,
          scheduleId: prediction.scheduleId,
          lineStopId: prediction.lineStopId,
          serviceDay: toPrismaServiceDay(prediction.serviceDay),
          predictedTime: prediction.predictedTime,
          predictedMinutes: prediction.predictedMinutes,
          sourceConfidence: prediction.sourceConfidence,
          sourceCollectedAt: prediction.sourceCollectedAt ? new Date(prediction.sourceCollectedAt) : undefined,
          note: prediction.note,
        }))
      );

      await createManyIfAny(
        transaction.routePath,
        plan.routePaths.map<Prisma.RoutePathCreateManyInput>((routePath) => ({
          id: routePath.id,
          directionId: routePath.directionId,
          sequence: routePath.sequence,
          latitude: routePath.latitude,
          longitude: routePath.longitude,
        }))
      );

      await createManyIfAny(
        transaction.fare,
        plan.fares.map<Prisma.FareCreateManyInput>((fare) => ({
          id: fare.id,
          lineId: fare.lineId,
          label: fare.label,
          riderCategory: fare.riderCategory,
          amountCents: fare.amountCents,
          currency: fare.currency,
          sortOrder: fare.sortOrder,
        }))
      );
    });

    return {
      datasetId: plan.datasetId,
      importedAt: new Date().toISOString(),
      lineIds: plan.lineIds,
      created: {
        transportLines: plan.transportLines.filter((line) => !existingLineIds.has(line.id)).length,
        stops: plan.stops.filter((stop) => !existingStopIds.has(stop.id)).length,
      },
      updated: {
        transportLines: plan.transportLines.filter((line) => existingLineIds.has(line.id)).length,
        stops: plan.stops.filter((stop) => existingStopIds.has(stop.id)).length,
      },
      counts: {
        transportLines: plan.transportLines.length,
        routeDirections: plan.routeDirections.length,
        stops: plan.stops.length,
        lineStops: plan.lineStops.length,
        schedules: plan.schedules.length,
        stopTimePredictions: plan.stopTimePredictions.length,
        routePaths: plan.routePaths.length,
        fares: plan.fares.length,
      },
    };
  }
}

export const normalizedDatasetImporter = new NormalizedDatasetImporter();
