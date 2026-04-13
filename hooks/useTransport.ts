'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FavoriteRecord, TransportLine } from '@cityline/shared';

const FAVORITES_STORAGE_KEY = 'cityline-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar favoritos do localStorage na montagem
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar favoritos no localStorage quando mudarem
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((lineId: string) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.lineId === lineId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          lineId,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeFavorite = useCallback((lineId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.lineId !== lineId));
  }, []);

  const toggleFavorite = useCallback((lineId: string) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.lineId === lineId);
      if (exists) {
        return prev.filter((fav) => fav.lineId !== lineId);
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          lineId,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const isFavorite = useCallback(
    (lineId: string) => favorites.some((fav) => fav.lineId === lineId),
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isLoaded,
  };
}

export function useBusSearch(lines: TransportLine[]) {
  const [query, setQuery] = useState('');

  const results = query.trim() === ''
    ? lines
    : lines.filter((line) => {
        const searchTerm = query.toLowerCase();
        return (
          line.code.toLowerCase().includes(searchTerm) ||
          line.name.toLowerCase().includes(searchTerm) ||
          line.routeLabel.toLowerCase().includes(searchTerm) ||
          line.summary.toLowerCase().includes(searchTerm)
        );
      });

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0,
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (err) {
      console.error(`Erro ao ler do localStorage (${key}):`, err);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error(`Erro ao escrever no localStorage (${key}):`, err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}
