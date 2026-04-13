'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ServiceDay, TransportMode } from '@cityline/shared';
import { DASHBOARD_TABS, DAY_OPTIONS, TRANSPORT_MODE_OPTIONS } from '@/constants/dashboard';
import { useLineSearch } from '@/hooks/use-line-search';
import { getActiveDayType } from '@/lib/transport';
import { DEFAULT_LOCALE, type UiLocale, getDayTypeLabel, uiCopy } from '@/lib/ui-copy';
import type { DashboardData } from '@/types/dashboard';

interface UseDashboardPreferencesInput {
  initialData: DashboardData;
  favoriteIds: string[];
}

interface UseDashboardPreferencesResult {
  hasMounted: boolean;
  locale: UiLocale;
  query: string;
  activeTab: (typeof DASHBOARD_TABS)[number]['id'];
  dayType: ServiceDay;
  modeFilter: 'all' | TransportMode;
  selectedLineId?: string;
  setLocale: React.Dispatch<React.SetStateAction<UiLocale>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<(typeof DASHBOARD_TABS)[number]['id']>>;
  setDayType: React.Dispatch<React.SetStateAction<ServiceDay>>;
  setModeFilter: React.Dispatch<React.SetStateAction<'all' | TransportMode>>;
  setSelectedLineId: React.Dispatch<React.SetStateAction<string | undefined>>;
  copy: (typeof uiCopy)[UiLocale];
  tabLabels: Array<{ id: (typeof DASHBOARD_TABS)[number]['id']; label: string }>;
  modeLabels: Array<{ id: 'all' | TransportMode; label: string }>;
  dayLabels: Array<{ id: ServiceDay; label: string }>;
  visibleLines: DashboardData['lines'];
  selectedLine: DashboardData['lines'][number] | null;
}

export function useDashboardPreferences({ initialData, favoriteIds }: UseDashboardPreferencesInput): UseDashboardPreferencesResult {
  const [hasMounted, setHasMounted] = useState(false);
  const [locale, setLocale] = useState<UiLocale>(DEFAULT_LOCALE);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<(typeof DASHBOARD_TABS)[number]['id']>('all');
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(initialData.lines[0]?.id);
  const [dayType, setDayType] = useState<ServiceDay>('weekday');
  const [modeFilter, setModeFilter] = useState<'all' | TransportMode>('all');
  const filteredLines = useLineSearch(initialData.lines, query);

  useEffect(() => {
    setHasMounted(true);
    setDayType(getActiveDayType());
    try {
      const storedLocale = window.localStorage.getItem('cityline:locale');
      if (storedLocale === 'pt-BR' || storedLocale === 'en' || storedLocale === 'es') setLocale(storedLocale);
    } catch {}
  }, []);

  useEffect(() => {
    if (hasMounted) window.localStorage.setItem('cityline:locale', locale);
  }, [hasMounted, locale]);

  const copy = uiCopy[locale];
  const tabLabels = useMemo(() => DASHBOARD_TABS.map((tab) => ({ id: tab.id, label: copy.tabs[tab.id] })), [copy]);
  const modeLabels = useMemo(() => TRANSPORT_MODE_OPTIONS.map((option) => ({ id: option.id as 'all' | TransportMode, label: copy.filters[option.id as 'all' | TransportMode] })), [copy]);
  const dayLabels = useMemo(() => DAY_OPTIONS.map((option) => ({ id: option.id, label: getDayTypeLabel(locale, option.id) })), [locale]);

  const visibleLines = useMemo(() => {
    let scopedLines = filteredLines;
    if (activeTab === 'favorites') scopedLines = scopedLines.filter((line) => favoriteIds.includes(line.id));
    if (activeTab === 'ferry') scopedLines = scopedLines.filter((line) => (line.mode ?? 'urban') === 'ferry');
    if (modeFilter !== 'all') scopedLines = scopedLines.filter((line) => (line.mode ?? 'urban') === modeFilter);
    return scopedLines;
  }, [activeTab, favoriteIds, filteredLines, modeFilter]);

  const selectedLine = useMemo(
    () => initialData.lines.find((line) => line.id === selectedLineId) ?? visibleLines[0] ?? null,
    [initialData.lines, selectedLineId, visibleLines]
  );

  return {
    hasMounted,
    locale,
    query,
    activeTab,
    dayType,
    modeFilter,
    selectedLineId,
    setLocale,
    setQuery,
    setActiveTab,
    setDayType,
    setModeFilter,
    setSelectedLineId,
    copy,
    tabLabels,
    modeLabels,
    dayLabels,
    visibleLines,
    selectedLine,
  };
}
