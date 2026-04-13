'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FavoriteRecord } from '@cityline/shared';
import { loadStoredAuthSession } from '@/services/auth/auth.service';
import { createFavorite, getFavorites, removeFavorite } from '@/services/transport/transport.service';

const STORAGE_KEY = 'cityline:favorites:v2';

export function useFavorites(initialFavorites: FavoriteRecord[] = []) {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(initialFavorites);
  const [hydrated, setHydrated] = useState(false);
  const [pendingLineIds, setPendingLineIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (rawValue) {
        setFavorites(JSON.parse(rawValue) as FavoriteRecord[]);
      } else {
        setFavorites(initialFavorites);
      }
    } catch {
      setFavorites(initialFavorites);
    } finally {
      setHydrated(true);
    }
  }, [initialFavorites]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const session = loadStoredAuthSession();
    if (!session?.token) return;

    let active = true;

    void getFavorites()
      .then((remoteFavorites) => {
        if (active) {
          setFavorites(remoteFavorites);
        }
      })
      .catch(() => {
        // Mantém os dados locais quando a API ou a sessão não estiverem disponíveis.
      });

    return () => {
      active = false;
    };
  }, [hydrated]);

  const isFavorite = useCallback(
    (lineId: string) => favorites.some((item) => item.lineId === lineId),
    [favorites]
  );

  const favoriteIds = useMemo(() => favorites.map((item) => item.lineId), [favorites]);

  const toggleFavorite = useCallback(
    async (lineId: string) => {
      setPendingLineIds((current) => [...current, lineId]);
      const existing = favorites.find((item) => item.lineId === lineId);

      if (existing) {
        setFavorites((current) => current.filter((item) => item.lineId !== lineId));

        try {
          await removeFavorite(existing.id);
        } catch {
          setFavorites((current) => (current.some((item) => item.lineId === lineId) ? current : [...current, existing]));
        } finally {
          setPendingLineIds((current) => current.filter((item) => item !== lineId));
        }

        return;
      }

      const optimisticFavorite: FavoriteRecord = {
        id: `fav-${lineId}`,
        lineId,
        createdAt: new Date().toISOString(),
      };

      setFavorites((current) => [...current, optimisticFavorite]);

      try {
        const savedFavorite = await createFavorite(lineId);
        setFavorites((current) => current.map((item) => (item.lineId === lineId ? savedFavorite : item)));
      } catch {
        // Mantém persistência local mesmo se o backend estiver indisponível.
      } finally {
        setPendingLineIds((current) => current.filter((item) => item !== lineId));
      }
    },
    [favorites]
  );

  return {
    favorites,
    favoriteIds,
    hydrated,
    pendingLineIds,
    isFavorite,
    toggleFavorite,
  };
}
