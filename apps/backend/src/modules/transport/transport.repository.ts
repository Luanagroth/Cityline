import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

export const transportLineArgs = Prisma.validator<Prisma.TransportLineDefaultArgs>()({
  include: {
    fares: {
      orderBy: {
        sortOrder: 'asc',
      },
    },
    directions: {
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        lineStops: {
          orderBy: {
            sequence: 'asc',
          },
          include: {
            stop: true,
          },
        },
        routePaths: {
          orderBy: {
            sequence: 'asc',
          },
        },
        schedules: {
          orderBy: [{ serviceDay: 'asc' }, { departureMinutes: 'asc' }],
        },
      },
    },
  },
});

export type TransportLineRecord = Prisma.TransportLineGetPayload<typeof transportLineArgs>;

export class TransportRepository {
  async listLines() {
    return prisma.transportLine.findMany({
      where: { isActive: true },
      orderBy: [{ transportMode: 'asc' }, { code: 'asc' }],
      ...transportLineArgs,
    });
  }

  async findLineByIdOrCode(identifier: string) {
    return prisma.transportLine.findFirst({
      where: {
        isActive: true,
        OR: [{ id: identifier }, { code: identifier }],
      },
      ...transportLineArgs,
    });
  }
}
