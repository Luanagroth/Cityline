'use client';

import type { TransportLine } from '@cityline/shared';
import { Clock3, Heart, MapPinned } from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import type { UiLocale } from '@/lib/ui-copy';
import { getLocalizedLineContent, getTransportModeLabel } from '@/lib/ui-copy';

interface LineCardProps {
  line: TransportLine;
  isFavorite: boolean;
  isPending?: boolean;
  locale?: UiLocale;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export function LineCard({ line, isFavorite, isPending = false, locale = 'pt-BR', onSelect, onToggleFavorite }: LineCardProps) {
  const localized = getLocalizedLineContent(locale, line);

  return (
    <article
      className="surface cursor-pointer p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: line.color }}
        >
          {line.code}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {getTransportModeLabel(locale, line.mode ?? 'urban')}
                </span>
                <StatusPill status={line.status} locale={locale} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{localized.name}</h3>
              <p className="text-xs text-slate-500">{localized.routeLabel}</p>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{localized.summary}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {line.estimatedDurationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinned className="h-3.5 w-3.5" />
              {line.distanceKm} km
            </span>
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={
            locale === 'en'
              ? isFavorite
                ? 'Remove favorite'
                : 'Favorite line'
              : locale === 'es'
                ? isFavorite
                  ? 'Quitar favorito'
                  : 'Guardar linea'
                : isFavorite
                  ? 'Remover favorito'
                  : 'Favoritar linha'
          }
        >
          <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          {isPending ? (
            <span className="sr-only">
              {locale === 'en' ? 'Saving favorite' : locale === 'es' ? 'Guardando favorito' : 'Salvando favorito'}
            </span>
          ) : null}
        </button>
      </div>
    </article>
  );
}
