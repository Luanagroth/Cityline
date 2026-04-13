import { PrismaClient, DirectionType, LineOperationalStatus, OccupancyLevel, ServiceDayType, TransportMode } from '@prisma/client';
import { buildLineDirections as buildSharedLineDirections, fallbackLines, inferInboundOffset as inferSharedInboundOffset, type GeoPoint, type ScheduleEntry, type ServiceDay, type StopPoint, type TransportLine } from '@cityline/shared';
import { getManualLineSeedConfig, type ManualFareSeed } from './seed-data/manual-transport-data.js';

const prisma = new PrismaClient();

const dayTypes: ServiceDay[] = ['weekday', 'saturday', 'sunday'];

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const toPrismaMode = (mode: TransportLine['mode']): TransportMode => {
  switch (mode) {
    case 'intercity':
      return TransportMode.INTERMUNICIPAL;
    case 'ferry':
      return TransportMode.FERRY;
    case 'urban':
    default:
      return TransportMode.MUNICIPAL;
  }
};

const toOperationalStatus = (status: TransportLine['status']): LineOperationalStatus => {
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

const toServiceDayType = (dayType: ServiceDay): ServiceDayType => {
  switch (dayType) {
    case 'saturday':
      return ServiceDayType.SATURDAY;
    case 'sunday':
      return ServiceDayType.SUNDAY;
    case 'weekday':
    default:
      return ServiceDayType.WEEKDAY;
  }
};

const toOccupancyLevel = (occupancy: ScheduleEntry['occupancy']): OccupancyLevel => {
  switch (occupancy) {
    case 'low':
      return OccupancyLevel.LOW;
    case 'high':
      return OccupancyLevel.HIGH;
    case 'medium':
    default:
      return OccupancyLevel.MEDIUM;
  }
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

const inferInboundOffset = (line: TransportLine, configuredOffset?: number) =>
  inferSharedInboundOffset(line, configuredOffset);

const buildDirections = (line: TransportLine) => {
  const config = getManualLineSeedConfig(line);
  const inboundOffsetMinutes = inferInboundOffset(line, config.inboundOffsetMinutes);
  const directions = buildSharedLineDirections(line, {
    outboundId: `${line.id}-outbound`,
    inboundId: `${line.id}-inbound`,
    inboundOffsetMinutes,
    inboundScheduleTag: 'inbound',
    inboundStopIdSuffix: '',
  });

  return directions.map((direction, index) => ({
    id: direction.id,
    slug: direction.type,
    type: direction.type === 'outbound' ? DirectionType.OUTBOUND : DirectionType.INBOUND,
    sortOrder: index,
    name: direction.label,
    routeLabel: direction.routeLabel,
    originLabel: direction.origin,
    destinationLabel: direction.destination,
    stops: direction.stops,
    path: direction.path,
    schedules: direction.schedules,
  }));
};

const buildStopId = (stop: StopPoint) => {
  const lat = stop.location.lat.toFixed(4).replace('.', '_').replace('-', 'm');
  const lng = stop.location.lng.toFixed(4).replace('.', '_').replace('-', 'm');
  return `stop-${slugify(stop.name)}-${lat}-${lng}`;
};

const collectStops = (lines: TransportLine[]) => {
  const stops = new Map<
    string,
    {
      id: string;
      name: string;
      slug: string;
      latitude: number;
      longitude: number;
    }
  >();

  for (const line of lines) {
    for (const stop of line.stops) {
      const id = buildStopId(stop);

      if (!stops.has(id)) {
        stops.set(id, {
          id,
          name: stop.name,
          slug: slugify(stop.name),
          latitude: stop.location.lat,
          longitude: stop.location.lng,
        });
      }
    }
  }

  return [...stops.values()];
};

const buildFareRecords = (line: TransportLine, fares: ManualFareSeed[]) =>
  fares.map((fare, index) => ({
    id: `${line.id}-fare-${index + 1}`,
    lineId: line.id,
    label: fare.label,
    riderCategory: fare.riderCategory ?? null,
    amountCents: fare.amountCents ?? null,
    currency: 'BRL',
    sortOrder: index,
  }));

const buildPathRecords = (directionId: string, points: GeoPoint[]) =>
  points.map((point, index) => ({
    id: `${directionId}-path-${index + 1}`,
    directionId,
    sequence: index + 1,
    latitude: point.lat,
    longitude: point.lng,
  }));

const buildLineStopRecords = (directionId: string, stops: StopPoint[]) =>
  stops.map((stop, index) => ({
    id: `${directionId}-stop-${index + 1}`,
    directionId,
    stopId: buildStopId(stop),
    sequence: index + 1,
    platform: null,
    distanceFromStartKm: null,
    isTimingPoint: index === 0 || index === stops.length - 1,
  }));

const buildScheduleRecords = (directionId: string, schedules: Record<ServiceDay, ScheduleEntry[]>) =>
  dayTypes.flatMap((dayType) =>
    schedules[dayType].map((schedule, index) => ({
      id: `${directionId}-${dayType}-${index + 1}`,
      directionId,
      serviceDay: toServiceDayType(dayType),
      departureTime: schedule.time,
      departureMinutes: toMinutes(schedule.time),
      isPeak: schedule.isPeak,
      occupancy: toOccupancyLevel(schedule.occupancy),
      platform: schedule.platform ?? null,
      note: null,
    }))
  );

async function seedTransportDomain() {
  const stopRecords = collectStops(fallbackLines);

  await prisma.routePath.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.lineStop.deleteMany();
  await prisma.fare.deleteMany();
  await prisma.routeDirection.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.transportLine.deleteMany();

  if (stopRecords.length) {
    await prisma.stop.createMany({ data: stopRecords });
  }

  for (const line of fallbackLines) {
    const lineConfig = getManualLineSeedConfig(line);
    const directions = buildDirections(line);

    await prisma.transportLine.create({
      data: {
        id: line.id,
        code: line.code,
        slug: slugify(`${line.code}-${line.name}`),
        name: line.name,
        operator: line.operator,
        summary: line.summary,
        routeLabel: line.routeLabel,
        originLabel: line.origin,
        destinationLabel: line.destination,
        transportMode: toPrismaMode(line.mode),
        operationalStatus: toOperationalStatus(line.status),
        estimatedDurationMinutes: line.estimatedDurationMinutes,
        distanceKm: line.distanceKm,
        fareSummary: line.fareLabel ?? null,
        color: line.color,
        amenities: JSON.stringify(line.amenities),
        sourceUpdatedAt: line.updatedAt ? new Date(line.updatedAt) : null,
      },
    });

    if (lineConfig.fareEntries?.length) {
      await prisma.fare.createMany({
        data: buildFareRecords(line, lineConfig.fareEntries),
      });
    }

    for (const direction of directions) {
      await prisma.routeDirection.create({
        data: {
          id: direction.id,
          lineId: line.id,
          type: direction.type,
          slug: direction.slug,
          name: direction.name,
          routeLabel: direction.routeLabel,
          originLabel: direction.originLabel,
          destinationLabel: direction.destinationLabel,
          sortOrder: direction.sortOrder,
          isLoop: false,
        },
      });

      const lineStopRecords = buildLineStopRecords(direction.id, direction.stops);
      if (lineStopRecords.length) {
        await prisma.lineStop.createMany({ data: lineStopRecords });
      }

      const routePathRecords = buildPathRecords(direction.id, direction.path);
      if (routePathRecords.length) {
        await prisma.routePath.createMany({ data: routePathRecords });
      }

      const scheduleRecords = buildScheduleRecords(direction.id, direction.schedules);
      if (scheduleRecords.length) {
        await prisma.schedule.createMany({ data: scheduleRecords });
      }
    }
  }
}

async function main() {
  await seedTransportDomain();
  console.log(`Seed concluída com ${fallbackLines.length} linhas e ${collectStops(fallbackLines).length} paradas únicas.`);
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed de mobilidade.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
