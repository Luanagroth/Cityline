'use client';

import { useMemo, useState } from 'react';
import { findNearestStops } from '@/lib/transport';
import { saveUserLocation } from '@/services/auth/auth.service';
import type { DashboardData } from '@/types/dashboard';

interface UseDashboardLocationInput {
  lines: DashboardData['lines'];
  isAuthenticated: boolean;
  location: { lat: number; lng: number } | null;
  requestLocation: () => Promise<void>;
}

export function useDashboardLocation({ lines, isAuthenticated, location, requestLocation }: UseDashboardLocationInput) {
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  const nearbyStops = useMemo(() => {
    if (!isAuthenticated || !location) return [];
    return findNearestStops(lines, location, 3);
  }, [isAuthenticated, lines, location]);

  const hasReliableNearbyStops = nearbyStops.length > 0 && nearbyStops[0]!.distanceMeters <= 2000;

  const handleSaveLocation = async () => {
    if (!location || !isAuthenticated) return;
    setSavingLocation(true);
    setLocationFeedback(null);
    try {
      await saveUserLocation({ latitude: location.lat, longitude: location.lng, label: 'Minha localizacao atual' });
      setLocationFeedback('Localizacao salva na sua conta com sucesso.');
    } catch (error) {
      setLocationFeedback(error instanceof Error ? error.message : 'Nao foi possivel salvar sua localizacao.');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleLocationAction = async () => {
    if (!isAuthenticated) {
      setLocationFeedback('Entre para usar localizacao em tempo real e receber a melhor parada para este sentido.');
      return;
    }
    await requestLocation();
  };

  return {
    nearbyStops,
    hasReliableNearbyStops,
    locationFeedback,
    savingLocation,
    handleSaveLocation,
    handleLocationAction,
  };
}
