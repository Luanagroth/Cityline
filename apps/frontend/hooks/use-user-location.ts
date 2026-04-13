'use client';

import { useCallback, useState } from 'react';
import type { GeoPoint } from '@cityline/shared';

export function useUserLocation() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const requestLocation = useCallback(async () => {
    if (!supported) {
      setError('Geolocalização não está disponível neste navegador.');
      return;
    }

    setIsLoading(true);
    setError(null);

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
          resolve();
        },
        (geoError) => {
          setError(
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Permissão de localização negada. Libere o acesso para ver os pontos próximos.'
              : 'Não foi possível obter sua localização agora.'
          );
          setIsLoading(false);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [supported]);

  return {
    supported,
    location,
    isLoading,
    error,
    requestLocation,
  };
}
