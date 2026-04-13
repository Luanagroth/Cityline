'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ServiceDay } from '@cityline/shared';
import { getLineDirectionPath, getLineDirectionSchedules, getLineDirections, getLineDirectionStops } from '@/services/transport/transport.service';
import type { DashboardData } from '@/types/dashboard';
import type { LineDirectionDetail, LineDirectionSummary } from '@/types/transport-detail';
import { buildDirectionDetailFromResponses, fallbackDirectionDetailsFromLine, fallbackDirectionSummariesFromLine } from '../lib/direction-view';

interface UseLineDirectionStateInput {
  selectedLine: DashboardData['lines'][number] | null;
  dayType: ServiceDay;
  hasMounted: boolean;
}

export function useLineDirectionState({ selectedLine, dayType, hasMounted }: UseLineDirectionStateInput) {
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | undefined>(undefined);
  const [directionOptions, setDirectionOptions] = useState<LineDirectionSummary[]>([]);
  const [activeDirectionDetail, setActiveDirectionDetail] = useState<LineDirectionDetail | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  const fallbackDirectionOptions = useMemo(() => (selectedLine ? fallbackDirectionSummariesFromLine(selectedLine) : []), [selectedLine]);
  const fallbackDirectionDetails = useMemo(
    () => (selectedLine ? fallbackDirectionDetailsFromLine(selectedLine, dayType, hasMounted ? new Date() : null) : []),
    [selectedLine, dayType, hasMounted]
  );

  const effectiveDirectionOptions = directionOptions.length ? directionOptions : fallbackDirectionOptions;
  const effectiveActiveDirection =
    activeDirectionDetail ?? fallbackDirectionDetails.find((direction) => direction.id === selectedDirectionId) ?? fallbackDirectionDetails[0] ?? null;

  useEffect(() => {
    setDirectionOptions([]);
    setActiveDirectionDetail(null);
    setDirectionsError(null);
    if (!selectedLine) {
      setSelectedDirectionId(undefined);
      return;
    }
    let cancelled = false;
    setDirectionsLoading(true);
    void getLineDirections(selectedLine.id)
      .then((items) => {
        if (cancelled) return;
        setDirectionOptions(items);
        setSelectedDirectionId((current) => (current && items.some((item) => item.id === current) ? current : items[0]?.id ?? fallbackDirectionOptions[0]?.id));
      })
      .catch((error) => {
        if (cancelled) return;
        setDirectionOptions([]);
        setDirectionsError(error instanceof Error ? error.message : 'Nao foi possivel carregar os sentidos desta linha.');
        setSelectedDirectionId((current) => current ?? fallbackDirectionOptions[0]?.id);
      })
      .finally(() => {
        if (!cancelled) setDirectionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLine, fallbackDirectionOptions]);

  useEffect(() => {
    if (!selectedLine || !selectedDirectionId) {
      setActiveDirectionDetail(null);
      return;
    }
    let cancelled = false;
    setDirectionsLoading(true);
    void Promise.all([
      getLineDirectionStops(selectedLine.id, selectedDirectionId),
      getLineDirectionSchedules(selectedLine.id, selectedDirectionId, dayType),
      getLineDirectionPath(selectedLine.id, selectedDirectionId),
    ])
      .then(([stopsResponse, schedulesResponse, pathResponse]) => {
        if (cancelled) return;
        setActiveDirectionDetail(buildDirectionDetailFromResponses(selectedLine, dayType, stopsResponse, schedulesResponse, pathResponse));
        setDirectionsError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setActiveDirectionDetail(null);
        setDirectionsError(error instanceof Error ? error.message : 'Nao foi possivel atualizar o detalhe do sentido.');
      })
      .finally(() => {
        if (!cancelled) setDirectionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLine, selectedDirectionId, dayType]);

  return {
    selectedDirectionId,
    setSelectedDirectionId,
    directionsLoading,
    directionsError,
    effectiveDirectionOptions,
    effectiveActiveDirection,
  };
}
