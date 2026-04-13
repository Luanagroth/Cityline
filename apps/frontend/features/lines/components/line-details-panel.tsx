'use client';

import { useEffect, useState } from 'react';
import type { ServiceDay, TransportLine } from '@cityline/shared';
import { ArrowRightLeft, Clock3, Heart, Route, Ticket } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/ui/status-pill';
import { DepartureList } from '@/features/schedules/components/departure-list';
import type { UiLocale } from '@/lib/ui-copy';
import { getLocalizedLineContent, uiCopy } from '@/lib/ui-copy';
import type { LineDirectionDetail, LineDirectionSummary } from '@/types/transport-detail';

interface LineDetailsPanelProps {
  line: TransportLine | null;
  dayType: ServiceDay;
  isFavorite: boolean;
  directions: LineDirectionSummary[];
  activeDirection: LineDirectionDetail | null;
  directionsLoading?: boolean;
  directionsError?: string | null;
  selectedDirectionId?: string;
  locale?: UiLocale;
  onDirectionChange: (directionId: string) => void;
  onToggleFavorite: () => void;
}

export function LineDetailsPanel({
  line,
  dayType,
  isFavorite,
  directions,
  activeDirection,
  directionsLoading = false,
  directionsError,
  selectedDirectionId,
  locale = 'pt-BR',
  onDirectionChange,
  onToggleFavorite,
}: LineDetailsPanelProps) {
  const [now, setNow] = useState<Date | null>(null);
  const copy = uiCopy[locale].labels;
  const localizedLine = line ? getLocalizedLineContent(locale, line) : null;

  useEffect(() => {
    const syncNow = () => setNow(new Date());

    syncNow();
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [line?.id, dayType]);

  const activeDirectionSummary = directions.find((direction) => direction.id === selectedDirectionId) ?? directions[0] ?? null;
  const activeSchedules = activeDirection?.schedules[dayType] ?? [];
  const nextDepartures = activeDirection?.nextDepartures ?? [];

  if (!line) {
    return (
      <EmptyState
        title={locale === 'en' ? 'Select a line' : locale === 'es' ? 'Selecciona una linea' : 'Selecione uma linha'}
        description={locale === 'en' ? 'Choose a line from the list to see schedules, route and map.' : locale === 'es' ? 'Elige una linea de la lista para ver horarios, ruta y mapa.' : 'Escolha uma linha na lista para ver horarios, rota e mapa.'}
        icon={<Route className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex rounded-xl px-2.5 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: line.color }}
              >
                {line.code}
              </span>
              <StatusPill status={line.status} locale={locale} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{localizedLine?.name ?? line.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{localizedLine?.summary ?? line.summary}</p>
            <p className="mt-2 text-xs font-medium text-brand-700">
              {activeDirection?.routeLabel ?? activeDirectionSummary?.routeLabel ?? localizedLine?.routeLabel ?? line.routeLabel}
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            onClick={onToggleFavorite}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-brand-100 bg-sky-50/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ArrowRightLeft className="h-4 w-4 text-brand-700" />
            {copy.chooseDirection}
          </div>
          <div className="flex flex-wrap gap-2">
            {directions.map((direction) => (
              <button
                key={direction.id}
                type="button"
                onClick={() => onDirectionChange(direction.id)}
                disabled={directionsLoading}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  (activeDirection?.id ?? activeDirectionSummary?.id) === direction.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-200'
                }`}
              >
                {direction.label}
              </button>
            ))}
          </div>
          {directionsLoading ? <p className="mt-2 text-xs text-slate-500">{copy.updatingDirection}</p> : null}
          {directionsError ? <p className="mt-2 text-xs text-rose-600">{directionsError}</p> : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="surface-muted p-3">
            <p className="text-xs text-slate-500">{copy.averageTime}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
              <Clock3 className="h-4 w-4 text-brand-700" />
              {line.estimatedDurationMinutes} min
            </p>
          </div>
          <div className="surface-muted p-3">
            <p className="text-xs text-slate-500">{copy.fare}</p>
            <p className="mt-1 inline-flex items-start gap-1 text-sm font-semibold text-slate-900">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span>{line.fareLabel ?? copy.consultOperator}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="surface p-4 sm:p-5">
        <DepartureList title={copy.upcomingDepartures} items={nextDepartures} compact referenceTime={now} locale={locale} />
        <div className="mt-4 border-t border-slate-100 pt-4">
          {activeSchedules.length ? (
            <DepartureList title={copy.fullSchedule} items={activeSchedules} referenceTime={now} locale={locale} />
          ) : (
            <EmptyState
              title={copy.noSchedules}
              description={copy.noSchedulesDescription}
              icon={<Clock3 className="h-5 w-5" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
