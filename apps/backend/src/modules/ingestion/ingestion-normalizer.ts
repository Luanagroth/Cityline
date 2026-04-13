import type {
  CollectedDeparture,
  CollectedDirection,
  CollectedFare,
  CollectedFerryRoute,
  CollectedLine,
  CollectedStop,
  CollectionMethod,
  FerryFare,
  FerrySchedule,
  NormalizedFare,
  NormalizedLineStop,
  NormalizedRouteDirection,
  NormalizedRoutePath,
  NormalizedSchedule,
  NormalizedStop,
  NormalizedTransportDataset,
  NormalizedTransportLine,
  StopTimePrediction,
} from '@cityline/shared';
import {
  collectedFerryRouteSchema,
  collectedLineSchema,
  normalizedTransportDatasetSchema,
} from './ingestion.schemas.js';
import {
  buildStableTransportLineId,
  buildStableDirectionId,
  buildStableFareId,
  buildStableLineStopId,
  buildStablePredictionId,
  buildStableRoutePathId,
  buildStableScheduleId,
  buildStableStopId,
  slugifyStable,
} from './ingestion-ids.js';

const DEFAULT_CURRENCY = 'BRL';

const toDomainMode = (mode: CollectedLine['mode']): NormalizedTransportLine['transportMode'] => {
  switch (mode) {
    case 'intercity':
      return 'intermunicipal';
    case 'ferry':
      return 'ferry';
    case 'urban':
    default:
      return 'municipal';
  }
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

const isPeakTime = (time: string) => ['06', '07', '08', '17', '18'].some((prefix) => time.startsWith(prefix));

const resolveAmountCents = (fare: CollectedFare) => {
  if (typeof fare.amountCents === 'number') {
    return fare.amountCents;
  }

  if (!fare.amountText) {
    return undefined;
  }

  const normalized = fare.amountText.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : undefined;
};

const buildFareSummary = (fares: CollectedFare[]) =>
  fares
    .map((fare) => {
      const amountCents = resolveAmountCents(fare);
      if (typeof amountCents === 'number') {
        return `${fare.label} R$ ${(amountCents / 100).toFixed(2).replace('.', ',')}`;
      }

      return fare.label;
    })
    .join(' · ');

const pickStopCoordinates = (stop: CollectedStop) => {
  if (!stop.location) {
    throw new Error(`Parada ${stop.id} (${stop.name}) sem coordenadas no manifest collected.`);
  }

  return stop.location;
};

const toDatasetMetadata = (source: CollectedLine['source'] | CollectedFerryRoute['source'], collectionMethod: CollectionMethod) => ({
  datasetId: `dataset-${slugifyStable(source.sourceId)}-${source.collectedAt.replace(/[:.]/g, '-')}`,
  createdAt: source.collectedAt,
  sourceName: source.sourceName,
  sourceUrl: source.sourceUrl,
  collectionMethod,
});

interface BuildContext {
  stops: Map<string, NormalizedStop>;
  transportLines: NormalizedTransportLine[];
  routeDirections: NormalizedRouteDirection[];
  lineStops: NormalizedLineStop[];
  schedules: NormalizedSchedule[];
  stopTimePredictions: StopTimePrediction[];
  routePaths: NormalizedRoutePath[];
  fares: NormalizedFare[];
  ferrySchedules: FerrySchedule[];
  ferryFares: FerryFare[];
}

const appendDirection = (
  lineId: string,
  direction: CollectedDirection,
  context: BuildContext,
  isFerry: boolean
) => {
  if (direction.type !== 'outbound' && direction.type !== 'inbound') {
    return;
  }

  const directionId = buildStableDirectionId(lineId, direction.type);

  context.routeDirections.push({
    id: directionId,
    lineId,
    type: direction.type,
    slug: direction.type,
    name: direction.name,
    routeLabel: direction.routeLabel,
    originLabel: direction.originLabel,
    destinationLabel: direction.destinationLabel,
    sortOrder: direction.type === 'outbound' ? 0 : 1,
    isLoop: direction.type === 'outbound' && direction.originLabel === direction.destinationLabel,
    sourceDirectionRef: direction.source.sourceDirectionRef,
  });

  for (const stop of [...direction.stops].sort((left, right) => left.sequence - right.sequence)) {
    const coordinates = pickStopCoordinates(stop);
    const stopId = buildStableStopId(stop.name, coordinates.lat, coordinates.lng);

    if (!context.stops.has(stopId)) {
      context.stops.set(stopId, {
        id: stopId,
        name: stop.name,
        slug: slugifyStable(stop.name),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        sourceStopRef: stop.sourceStopRef,
      });
    }

    const lineStopId = buildStableLineStopId(directionId, stop.sequence);

    context.lineStops.push({
      id: lineStopId,
      directionId,
      stopId,
      sequence: stop.sequence,
      platform: stop.platform,
      isTimingPoint: stop.isTimingPoint ?? false,
    });
  }

  for (const point of [...direction.mapPath].sort((left, right) => left.sequence - right.sequence)) {
    context.routePaths.push({
      id: buildStableRoutePathId(directionId, point.sequence),
      directionId,
      sequence: point.sequence,
      latitude: point.lat,
      longitude: point.lng,
    });
  }

  for (const departure of direction.departures) {
    appendDeparture(directionId, departure, context, isFerry, lineId);
  }
};

const appendDeparture = (
  directionId: string,
  departure: CollectedDeparture,
  context: BuildContext,
  isFerry: boolean,
  lineId: string
) => {
  const scheduleId = buildStableScheduleId(directionId, departure.serviceDay, departure.departureTime, departure.id);
  const schedule: NormalizedSchedule = {
    id: scheduleId,
    directionId,
    serviceDay: departure.serviceDay,
    departureTime: departure.departureTime,
    departureMinutes: toMinutes(departure.departureTime),
    isPeak: isPeakTime(departure.departureTime),
    occupancy: 'medium',
    platform: departure.platform,
    note: departure.note,
  };

  if (isFerry) {
    context.ferrySchedules.push({
      id: scheduleId,
      lineId,
      directionId,
      serviceDay: departure.serviceDay,
      departureTime: departure.departureTime,
      departureMinutes: schedule.departureMinutes,
      platform: departure.platform,
      note: departure.note,
    });
  } else {
    context.schedules.push(schedule);
  }

  for (const prediction of departure.stopPredictions) {
    const lineStopId = buildStableLineStopId(directionId, prediction.stopSequence);
    const predictedTime = prediction.normalizedTime ?? prediction.displayTime;
    context.stopTimePredictions.push({
      id: buildStablePredictionId(scheduleId, lineStopId),
      scheduleId,
      lineStopId,
      serviceDay: departure.serviceDay,
      predictedTime,
      predictedMinutes: typeof prediction.predictedMinutes === 'number' ? prediction.predictedMinutes : toMinutes(predictedTime),
      sourceConfidence: prediction.sourceConfidence,
      note: prediction.notes,
    });
  }
};

const appendFares = (lineId: string, fares: CollectedFare[], context: BuildContext, isFerry: boolean) => {
  fares.forEach((fare, index) => {
    const normalizedFare: NormalizedFare = {
      id: buildStableFareId(lineId, fare.label, fare.riderCategory, index, fare.id),
      lineId,
      label: fare.label,
      riderCategory: fare.riderCategory,
      amountCents: resolveAmountCents(fare),
      currency: fare.currency ?? DEFAULT_CURRENCY,
      sortOrder: index,
    };

    context.fares.push(normalizedFare);

    if (isFerry) {
      context.ferryFares.push({
        ...normalizedFare,
      });
    }
  });
};

export interface NormalizeCollectedInput {
  lines?: CollectedLine[];
  ferryRoutes?: CollectedFerryRoute[];
}

export const normalizeCollectedTransport = (input: NormalizeCollectedInput): NormalizedTransportDataset => {
  const validatedLines = (input.lines ?? []).map((line) => collectedLineSchema.parse(line));
  const validatedFerryRoutes = (input.ferryRoutes ?? []).map((route) => collectedFerryRouteSchema.parse(route));

  const seedSource = validatedLines[0]?.source ?? validatedFerryRoutes[0]?.source;

  if (!seedSource) {
    throw new Error('Nenhum manifest collected foi informado para normalizacao.');
  }

  const context: BuildContext = {
    stops: new Map<string, NormalizedStop>(),
    transportLines: [],
    routeDirections: [],
    lineStops: [],
    schedules: [],
    stopTimePredictions: [],
    routePaths: [],
    fares: [],
    ferrySchedules: [],
    ferryFares: [],
  };

  for (const line of validatedLines) {
    const lineId = buildStableTransportLineId(toDomainMode(line.mode), line.code);
    context.transportLines.push({
      id: lineId,
      code: line.code,
      slug: line.slug,
      name: line.name,
      operator: line.operator,
      summary: line.summary,
      routeLabel: line.routeLabel,
      originLabel: line.originLabel,
      destinationLabel: line.destinationLabel,
      transportMode: toDomainMode(line.mode),
      operationalStatus: 'on-time',
      estimatedDurationMinutes: line.estimatedDurationMinutes,
      distanceKm: line.distanceKm,
      fareSummary: line.fares.length ? buildFareSummary(line.fares) : undefined,
      color: line.color,
      amenities: [],
      sourceUpdatedAt: line.source.collectedAt,
      sourceLineRef: line.source.sourceLineRef ?? line.code,
      isActive: true,
    });

    appendFares(lineId, line.fares, context, false);
    for (const direction of line.directions) {
      appendDirection(lineId, direction, context, false);
    }
  }

  for (const route of validatedFerryRoutes) {
    const lineId = buildStableTransportLineId('ferry', route.code);
    context.transportLines.push({
      id: lineId,
      code: route.code,
      slug: route.slug,
      name: route.routeLabel,
      operator: route.operator,
      summary: route.summary,
      routeLabel: route.routeLabel,
      originLabel: route.originLabel,
      destinationLabel: route.destinationLabel,
      transportMode: 'ferry',
      operationalStatus: 'on-time',
      fareSummary: route.fares.length ? buildFareSummary(route.fares) : undefined,
      amenities: [],
      sourceUpdatedAt: route.source.collectedAt,
      sourceLineRef: route.source.sourceLineRef ?? route.code,
      isActive: true,
    });

    appendFares(lineId, route.fares, context, true);
    for (const direction of route.directions) {
      appendDirection(lineId, direction, context, true);
    }
  }

  const dataset: NormalizedTransportDataset = {
    metadata: toDatasetMetadata(seedSource, seedSource.collectionMethod),
    transportLines: context.transportLines,
    routeDirections: context.routeDirections,
    stops: [...context.stops.values()],
    lineStops: context.lineStops,
    schedules: context.schedules,
    stopTimePredictions: context.stopTimePredictions,
    routePaths: context.routePaths,
    fares: context.fares,
    ferrySchedules: context.ferrySchedules,
    ferryFares: context.ferryFares,
  };

  return normalizedTransportDatasetSchema.parse(dataset);
};
