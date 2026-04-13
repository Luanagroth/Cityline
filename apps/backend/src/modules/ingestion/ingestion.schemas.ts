import { z } from 'zod';

const serviceDaySchema = z.enum(['weekday', 'saturday', 'sunday']);
const transportModeSchema = z.enum(['urban', 'intercity', 'ferry']);
const collectionMethodSchema = z.enum(['manual', 'semi-assisted', 'imported']);
const collectionStatusSchema = z.enum(['draft', 'reviewed', 'published']);
const sourceConfidenceSchema = z.enum(['high', 'medium', 'low']);
const occupancySchema = z.enum(['low', 'medium', 'high']);

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const sourceReferenceSchema = z.object({
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  collectedAt: z.string().datetime(),
  collectedBy: z.string().min(1).optional(),
  collectionMethod: collectionMethodSchema,
  sourceLineRef: z.string().min(1).optional(),
  sourceDirectionRef: z.string().min(1).optional(),
  sourceStopRef: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export const collectedFareSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  riderCategory: z.string().min(1).optional(),
  amountText: z.string().min(1).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).max(3).optional(),
  appliesTo: z.enum(['line', 'ferry']),
  notes: z.string().min(1).optional(),
  source: sourceReferenceSchema,
});

export const collectedRoutePathPointSchema = geoPointSchema.extend({
  sequence: z.number().int().positive(),
});

export const collectedStopSchema = z.object({
  id: z.string().min(1),
  sourceStopRef: z.string().min(1).optional(),
  name: z.string().min(1),
  sequence: z.number().int().positive(),
  platform: z.string().min(1).optional(),
  location: geoPointSchema.optional(),
  isTimingPoint: z.boolean().optional(),
  notes: z.string().min(1).optional(),
});

export const collectedStopTimePredictionSchema = z.object({
  id: z.string().min(1),
  stopId: z.string().min(1),
  stopSequence: z.number().int().positive(),
  displayTime: z.string().min(1),
  normalizedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  predictedMinutes: z.number().int().nonnegative().optional(),
  sourceConfidence: sourceConfidenceSchema.optional(),
  notes: z.string().min(1).optional(),
});

export const collectedDepartureSchema = z.object({
  id: z.string().min(1),
  serviceDay: serviceDaySchema,
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  platform: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
  stopPredictions: z.array(collectedStopTimePredictionSchema),
});

export const collectedDirectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['outbound', 'inbound', 'loop', 'variant']),
  name: z.string().min(1),
  routeLabel: z.string().min(1),
  originLabel: z.string().min(1),
  destinationLabel: z.string().min(1),
  mapPath: z.array(collectedRoutePathPointSchema),
  stops: z.array(collectedStopSchema),
  departures: z.array(collectedDepartureSchema),
  source: sourceReferenceSchema,
});

export const collectedLineSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  operator: z.string().min(1),
  mode: transportModeSchema,
  summary: z.string().min(1).optional(),
  routeLabel: z.string().min(1),
  originLabel: z.string().min(1),
  destinationLabel: z.string().min(1),
  color: z.string().min(1).optional(),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  distanceKm: z.number().nonnegative().optional(),
  fares: z.array(collectedFareSchema),
  directions: z.array(collectedDirectionSchema),
  collectionStatus: collectionStatusSchema,
  source: sourceReferenceSchema,
});

export const collectedFerryRouteSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  slug: z.string().min(1),
  operator: z.string().min(1),
  routeLabel: z.string().min(1),
  originLabel: z.string().min(1),
  destinationLabel: z.string().min(1),
  summary: z.string().min(1).optional(),
  fares: z.array(collectedFareSchema),
  directions: z.array(collectedDirectionSchema),
  collectionStatus: collectionStatusSchema,
  source: sourceReferenceSchema,
});

export const normalizedTransportLineSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  operator: z.string().min(1),
  summary: z.string().min(1).optional(),
  routeLabel: z.string().min(1),
  originLabel: z.string().min(1),
  destinationLabel: z.string().min(1),
  transportMode: z.enum(['municipal', 'intermunicipal', 'ferry']),
  operationalStatus: z.enum(['on-time', 'attention', 'reduced']),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  distanceKm: z.number().nonnegative().optional(),
  fareSummary: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  amenities: z.array(z.string()),
  sourceUpdatedAt: z.string().datetime().optional(),
  sourceLineRef: z.string().min(1).optional(),
  isActive: z.boolean(),
});

export const normalizedRouteDirectionSchema = z.object({
  id: z.string().min(1),
  lineId: z.string().min(1),
  type: z.enum(['outbound', 'inbound']),
  slug: z.string().min(1),
  name: z.string().min(1),
  routeLabel: z.string().min(1),
  originLabel: z.string().min(1),
  destinationLabel: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  isLoop: z.boolean(),
  sourceDirectionRef: z.string().min(1).optional(),
});

export const normalizedStopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(1).optional(),
  sourceStopRef: z.string().min(1).optional(),
});

export const normalizedLineStopSchema = z.object({
  id: z.string().min(1),
  directionId: z.string().min(1),
  stopId: z.string().min(1),
  sequence: z.number().int().positive(),
  distanceFromStartKm: z.number().nonnegative().optional(),
  platform: z.string().min(1).optional(),
  isTimingPoint: z.boolean(),
});

export const normalizedScheduleSchema = z.object({
  id: z.string().min(1),
  directionId: z.string().min(1),
  serviceDay: serviceDaySchema,
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  departureMinutes: z.number().int().nonnegative(),
  isPeak: z.boolean(),
  occupancy: occupancySchema,
  platform: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
});

export const stopTimePredictionSchema = z.object({
  id: z.string().min(1),
  scheduleId: z.string().min(1),
  lineStopId: z.string().min(1),
  serviceDay: serviceDaySchema,
  predictedTime: z.string().regex(/^\d{2}:\d{2}$/),
  predictedMinutes: z.number().int().nonnegative(),
  sourceConfidence: sourceConfidenceSchema.optional(),
  sourceCollectedAt: z.string().datetime().optional(),
  note: z.string().min(1).optional(),
});

export const normalizedRoutePathSchema = z.object({
  id: z.string().min(1),
  directionId: z.string().min(1),
  sequence: z.number().int().positive(),
  latitude: z.number(),
  longitude: z.number(),
});

export const normalizedFareSchema = z.object({
  id: z.string().min(1),
  lineId: z.string().min(1),
  label: z.string().min(1),
  riderCategory: z.string().min(1).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).max(3),
  sortOrder: z.number().int().nonnegative(),
});

export const ferryScheduleSchema = z.object({
  id: z.string().min(1),
  lineId: z.string().min(1),
  directionId: z.string().min(1),
  serviceDay: serviceDaySchema,
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  departureMinutes: z.number().int().nonnegative(),
  platform: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
});

export const ferryFareSchema = z.object({
  id: z.string().min(1),
  lineId: z.string().min(1),
  label: z.string().min(1),
  riderCategory: z.string().min(1).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).max(3),
  sortOrder: z.number().int().nonnegative(),
});

export const normalizedTransportDatasetSchema = z.object({
  metadata: z.object({
    datasetId: z.string().min(1),
    createdAt: z.string().datetime(),
    sourceName: z.string().min(1),
    sourceUrl: z.string().url(),
    collectionMethod: collectionMethodSchema,
  }),
  transportLines: z.array(normalizedTransportLineSchema),
  routeDirections: z.array(normalizedRouteDirectionSchema),
  stops: z.array(normalizedStopSchema),
  lineStops: z.array(normalizedLineStopSchema),
  schedules: z.array(normalizedScheduleSchema),
  stopTimePredictions: z.array(stopTimePredictionSchema),
  routePaths: z.array(normalizedRoutePathSchema),
  fares: z.array(normalizedFareSchema),
  ferrySchedules: z.array(ferryScheduleSchema),
  ferryFares: z.array(ferryFareSchema),
});
