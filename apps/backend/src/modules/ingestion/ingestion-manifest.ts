import { z } from 'zod';
import type {
  CollectedFerryRoute,
  CollectedLine,
  NormalizedTransportDataset,
} from '@cityline/shared';
import {
  collectedFerryRouteSchema,
  collectedLineSchema,
  normalizedTransportDatasetSchema,
} from './ingestion.schemas.js';

export type CollectedEntityType = 'line' | 'ferry-route';

export interface CollectedManifestFile {
  manifestVersion: '1.0';
  citySlug: string;
  providerSlug: string;
  entityType: CollectedEntityType;
  data: CollectedLine | CollectedFerryRoute;
}

export interface NormalizedManifestFile {
  manifestVersion: '1.0';
  citySlug: string;
  dataset: NormalizedTransportDataset;
}

const collectedBaseSchema = z.object({
  manifestVersion: z.literal('1.0'),
  citySlug: z.string().min(1),
  providerSlug: z.string().min(1),
});

export const collectedLineManifestSchema = collectedBaseSchema.extend({
  entityType: z.literal('line'),
  data: collectedLineSchema,
});

export const collectedFerryManifestSchema = collectedBaseSchema.extend({
  entityType: z.literal('ferry-route'),
  data: collectedFerryRouteSchema,
});

export const collectedManifestSchema = z.discriminatedUnion('entityType', [
  collectedLineManifestSchema,
  collectedFerryManifestSchema,
]);

export const normalizedManifestSchema = z.object({
  manifestVersion: z.literal('1.0'),
  citySlug: z.string().min(1),
  dataset: normalizedTransportDatasetSchema,
});

export const parseCollectedManifest = (input: unknown): CollectedManifestFile =>
  collectedManifestSchema.parse(input) as CollectedManifestFile;

export const parseNormalizedManifest = (input: unknown): NormalizedManifestFile =>
  normalizedManifestSchema.parse(input) as NormalizedManifestFile;
