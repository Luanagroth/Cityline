import { describe, expect, it, vi } from 'vitest';
import { normalizedTransportDatasetExample } from '@cityline/shared';
import { buildNormalizedImportPlan, NormalizedDatasetImporter } from './ingestion-importer.js';

const createMockDatabase = () => {
  const operations: string[] = [];
  const transaction = {
    transportLine: {
      findMany: vi.fn(async () => []),
      upsert: vi.fn(async ({ where }: { where: { id: string } }) => {
        operations.push(`transportLine.upsert:${where.id}`);
      }),
    },
    stop: {
      findMany: vi.fn(async () => []),
      upsert: vi.fn(async ({ where }: { where: { id: string } }) => {
        operations.push(`stop.upsert:${where.id}`);
      }),
    },
    fare: {
      deleteMany: vi.fn(async () => {
        operations.push('fare.deleteMany');
      }),
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        operations.push(`fare.createMany:${data.length}`);
      }),
    },
    routeDirection: {
      deleteMany: vi.fn(async () => {
        operations.push('routeDirection.deleteMany');
      }),
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        operations.push(`routeDirection.createMany:${data.length}`);
      }),
    },
    lineStop: {
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        operations.push(`lineStop.createMany:${data.length}`);
      }),
    },
    schedule: {
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        operations.push(`schedule.createMany:${data.length}`);
      }),
    },
    stopTimePrediction: {
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        operations.push(`stopTimePrediction.createMany:${data.length}`);
      }),
    },
    routePath: {
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        operations.push(`routePath.createMany:${data.length}`);
      }),
    },
  };

  return {
    operations,
    database: {
      ...transaction,
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    },
  };
};

describe('normalized dataset importer', () => {
  it('monta um plano unico de persistencia para onibus e ferry', () => {
    const plan = buildNormalizedImportPlan(normalizedTransportDatasetExample);

    expect(plan.lineIds).toEqual(['line-100', 'ferry-01']);
    expect(plan.directionIds).toEqual(['line-100-outbound', 'ferry-01-outbound']);
    expect(plan.schedules.some((schedule) => schedule.directionId === 'ferry-01-outbound')).toBe(true);
    expect(plan.fares).toHaveLength(3);
  });

  it('executa importacao transacional em modo snapshot por linha', async () => {
    const { database, operations } = createMockDatabase();
    const importer = new NormalizedDatasetImporter(database as never);

    const result = await importer.importDataset(normalizedTransportDatasetExample);

    expect(result.lineIds).toEqual(['line-100', 'ferry-01']);
    expect(result.counts.transportLines).toBe(2);
    expect(result.counts.schedules).toBe(4);
    expect(result.created.transportLines).toBe(2);
    expect(result.created.stops).toBe(6);
    expect(operations).toContain('fare.deleteMany');
    expect(operations).toContain('routeDirection.deleteMany');
    expect(operations).toContain('routeDirection.createMany:2');
    expect(operations).toContain('lineStop.createMany:6');
    expect(operations).toContain('schedule.createMany:4');
    expect(operations).toContain('fare.createMany:3');
  });
});
