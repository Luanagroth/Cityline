import type { CollectedFerryRoute, CollectedLine, NormalizedTransportDataset } from '@cityline/shared';
import { normalizedDatasetImporter, type NormalizedImportResult } from './ingestion-importer.js';
import { normalizeCollectedTransport } from './ingestion-normalizer.js';

export interface IngestionManifestBundle {
  lines?: CollectedLine[];
  ferryRoutes?: CollectedFerryRoute[];
}

export class IngestionService {
  normalizeCollected(bundle: IngestionManifestBundle): NormalizedTransportDataset {
    return normalizeCollectedTransport(bundle);
  }

  async importNormalized(dataset: NormalizedTransportDataset): Promise<NormalizedImportResult> {
    return normalizedDatasetImporter.importDataset(dataset);
  }
}

export const ingestionService = new IngestionService();
