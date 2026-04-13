import type { GeoPoint, ServiceDay, TransportMode } from './transport.js';

export type CollectionMethod = 'manual' | 'semi-assisted' | 'imported';
export type CollectionStatus = 'draft' | 'reviewed' | 'published';
export type OccupancyLevel = 'low' | 'medium' | 'high';
export type SourceConfidence = 'high' | 'medium' | 'low';

export interface SourceReference {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  collectedAt: string;
  collectedBy?: string;
  collectionMethod: CollectionMethod;
  sourceLineRef?: string;
  sourceDirectionRef?: string;
  sourceStopRef?: string;
  notes?: string;
}

export interface CollectedFare {
  id: string;
  label: string;
  riderCategory?: string;
  amountText?: string;
  amountCents?: number;
  currency?: string;
  appliesTo: 'line' | 'ferry';
  notes?: string;
  source: SourceReference;
}

export interface CollectedRoutePathPoint extends GeoPoint {
  sequence: number;
}

export interface CollectedStop {
  id: string;
  sourceStopRef?: string;
  name: string;
  sequence: number;
  platform?: string;
  location?: GeoPoint;
  isTimingPoint?: boolean;
  notes?: string;
}

export interface CollectedStopTimePrediction {
  id: string;
  stopId: string;
  stopSequence: number;
  displayTime: string;
  normalizedTime?: string;
  predictedMinutes?: number;
  sourceConfidence?: SourceConfidence;
  notes?: string;
}

export interface CollectedDeparture {
  id: string;
  serviceDay: ServiceDay;
  departureTime: string;
  platform?: string;
  note?: string;
  stopPredictions: CollectedStopTimePrediction[];
}

export interface CollectedDirection {
  id: string;
  type: 'outbound' | 'inbound' | 'loop' | 'variant';
  name: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  mapPath: CollectedRoutePathPoint[];
  stops: CollectedStop[];
  departures: CollectedDeparture[];
  source: SourceReference;
}

export interface CollectedLine {
  id: string;
  code: string;
  slug: string;
  name: string;
  operator: string;
  mode: TransportMode;
  summary?: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  color?: string;
  estimatedDurationMinutes?: number;
  distanceKm?: number;
  fares: CollectedFare[];
  directions: CollectedDirection[];
  collectionStatus: CollectionStatus;
  source: SourceReference;
}

export interface CollectedFerryRoute {
  id: string;
  code: string;
  slug: string;
  operator: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  summary?: string;
  fares: CollectedFare[];
  directions: CollectedDirection[];
  collectionStatus: CollectionStatus;
  source: SourceReference;
}

export interface StopTimePrediction {
  id: string;
  scheduleId: string;
  lineStopId: string;
  serviceDay: ServiceDay;
  predictedTime: string;
  predictedMinutes: number;
  sourceConfidence?: SourceConfidence;
  sourceCollectedAt?: string;
  note?: string;
}

export interface FerrySchedule {
  id: string;
  lineId: string;
  directionId: string;
  serviceDay: ServiceDay;
  departureTime: string;
  departureMinutes: number;
  platform?: string;
  note?: string;
}

export interface FerryFare {
  id: string;
  lineId: string;
  label: string;
  riderCategory?: string;
  amountCents?: number;
  currency: string;
  sortOrder: number;
}

export interface NormalizedTransportLine {
  id: string;
  code: string;
  slug: string;
  name: string;
  operator: string;
  summary?: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  transportMode: 'municipal' | 'intermunicipal' | 'ferry';
  operationalStatus: 'on-time' | 'attention' | 'reduced';
  estimatedDurationMinutes?: number;
  distanceKm?: number;
  fareSummary?: string;
  color?: string;
  amenities: string[];
  sourceUpdatedAt?: string;
  sourceLineRef?: string;
  isActive: boolean;
}

export interface NormalizedRouteDirection {
  id: string;
  lineId: string;
  type: 'outbound' | 'inbound';
  slug: string;
  name: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  sortOrder: number;
  isLoop: boolean;
  sourceDirectionRef?: string;
}

export interface NormalizedStop {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  description?: string;
  sourceStopRef?: string;
}

export interface NormalizedLineStop {
  id: string;
  directionId: string;
  stopId: string;
  sequence: number;
  distanceFromStartKm?: number;
  platform?: string;
  isTimingPoint: boolean;
}

export interface NormalizedSchedule {
  id: string;
  directionId: string;
  serviceDay: ServiceDay;
  departureTime: string;
  departureMinutes: number;
  isPeak: boolean;
  occupancy: OccupancyLevel;
  platform?: string;
  note?: string;
}

export interface NormalizedRoutePath {
  id: string;
  directionId: string;
  sequence: number;
  latitude: number;
  longitude: number;
}

export interface NormalizedFare {
  id: string;
  lineId: string;
  label: string;
  riderCategory?: string;
  amountCents?: number;
  currency: string;
  sortOrder: number;
}

export interface NormalizedTransportDataset {
  metadata: {
    datasetId: string;
    createdAt: string;
    sourceName: string;
    sourceUrl: string;
    collectionMethod: CollectionMethod;
  };
  transportLines: NormalizedTransportLine[];
  routeDirections: NormalizedRouteDirection[];
  stops: NormalizedStop[];
  lineStops: NormalizedLineStop[];
  schedules: NormalizedSchedule[];
  stopTimePredictions: StopTimePrediction[];
  routePaths: NormalizedRoutePath[];
  fares: NormalizedFare[];
  ferrySchedules: FerrySchedule[];
  ferryFares: FerryFare[];
}
