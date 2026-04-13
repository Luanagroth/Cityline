import type { FavoriteRecord } from '@cityline/shared';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { transportService } from '../transport/transport.service.js';
import { FavoritesRepository } from './favorites.repository.js';

const toFavoriteRecord = (item: {
  id: string;
  lineId: string;
  label: string | null;
  createdAt: Date;
}): FavoriteRecord => ({
  id: item.id,
  lineId: item.lineId,
  label: item.label ?? undefined,
  createdAt: item.createdAt.toISOString(),
});

class FavoritesService {
  private readonly repository = new FavoritesRepository();

  async listFavorites(userId?: string) {
    if (!userId) {
      return this.repository.list();
    }

    const items = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map(toFavoriteRecord);
  }

  async addFavorite(input: { lineId: string; label?: string }, userId?: string) {
    await transportService.getLineById(input.lineId);

    if (userId) {
      const existing = await prisma.favorite.findUnique({
        where: {
          userId_lineId: {
            userId,
            lineId: input.lineId,
          },
        },
      });

      if (existing) {
        return toFavoriteRecord(existing);
      }

      const created = await prisma.favorite.create({
        data: {
          userId,
          lineId: input.lineId,
          label: input.label,
        },
      });

      return toFavoriteRecord(created);
    }

    const current = await this.repository.list();
    const existing = current.find((item) => item.lineId === input.lineId);

    if (existing) {
      return existing;
    }

    const nextItem: FavoriteRecord = {
      id: `fav-${input.lineId}`,
      lineId: input.lineId,
      label: input.label,
      createdAt: new Date().toISOString(),
    };

    await this.repository.saveAll([...current, nextItem]);
    return nextItem;
  }

  async removeFavorite(favoriteId: string, userId?: string) {
    if (userId) {
      const current = await prisma.favorite.findFirst({
        where: {
          userId,
          OR: [{ id: favoriteId }, { lineId: favoriteId }],
        },
      });

      if (!current) {
        throw new AppError(404, 'FAVORITE_NOT_FOUND', 'Favorito não encontrado para remoção.');
      }

      await prisma.favorite.delete({ where: { id: current.id } });
      return { removedId: favoriteId };
    }

    const current = await this.repository.list();
    const nextItems = current.filter((item) => item.id !== favoriteId && item.lineId !== favoriteId);

    if (nextItems.length === current.length) {
      throw new AppError(404, 'FAVORITE_NOT_FOUND', 'Favorito não encontrado para remoção.');
    }

    await this.repository.saveAll(nextItems);
    return { removedId: favoriteId };
  }
}

export const favoritesService = new FavoritesService();
