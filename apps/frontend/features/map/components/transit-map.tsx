'use client';

import { Fragment, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { GeoPoint, StopPoint } from '@cityline/shared';
import { cityMapCenter } from '@cityline/shared';
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { UiLocale } from '@/lib/ui-copy';
import { uiCopy } from '@/lib/ui-copy';
import { requestApi } from '@/services/api/client';
import type { MapLineView } from '@/types/dashboard';

interface ActiveDirectionMapView {
  origin: string;
  destination: string;
  routeLabel: string;
  path: GeoPoint[];
  stops: StopPoint[];
}

export interface TransitMapProps {
  lines: MapLineView[];
  activeLineId?: string;
  activeDirectionId?: string;
  activeDirection?: ActiveDirectionMapView | null;
  userLocation?: GeoPoint;
  highlightedStopId?: string;
  locale?: UiLocale;
  onSelectLine?: (lineId: string) => void;
}

interface BackendStopMapItem {
  id: string;
  name: string;
  sequence: number;
  location: GeoPoint;
}

interface BackendDirectionPathResponse {
  path: GeoPoint[];
}

function MapViewportSync({ points }: { points: GeoPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const normalizedPoints = points
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point) => [point.lat, point.lng] as [number, number]);

    if (!normalizedPoints.length) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (!map.getContainer()?.isConnected) {
        return;
      }

      map.invalidateSize(false);

      if (normalizedPoints.length === 1) {
        map.setView(normalizedPoints[0]!, 13, { animate: false });
        return;
      }

      map.fitBounds(normalizedPoints, { padding: [28, 28], maxZoom: 14, animate: false });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [map, points]);

  return null;
}

export function TransitMap({ lines, activeLineId, activeDirectionId, activeDirection, userLocation, highlightedStopId, locale = 'pt-BR', onSelectLine }: TransitMapProps) {
  const copy = uiCopy[locale].labels;
  const [backendStops, setBackendStops] = useState<BackendStopMapItem[]>([]);
  const [backendPath, setBackendPath] = useState<GeoPoint[]>([]);
  const activeLine = lines.find((line) => line.id === activeLineId) ?? lines[0];
  const highlightedLineId = activeLineId ?? activeLine?.id;
  const center = activeDirection?.path[0] ?? activeLine?.path[0] ?? cityMapCenter;
  const focusPoints = [
    ...(activeDirection?.path ?? activeLine?.path ?? []),
    ...backendPath,
    ...backendStops.map((stop) => stop.location),
    ...(userLocation ? [userLocation] : []),
  ];

  useEffect(() => {
    if (!activeLineId || !activeDirectionId) {
      setBackendStops([]);
      return;
    }

    let cancelled = false;

    const loadBackendStops = async () => {
      try {
        const data = await requestApi<{ items: BackendStopMapItem[] }>(
          `/lines/${activeLineId}/directions/${activeDirectionId}/stops`,
          undefined,
          { revalidate: 0 }
        );

        if (!cancelled) {
          setBackendStops(data.items);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(`Falha ao carregar stops reais de ${activeLineId}/${activeDirectionId} para o mapa.`, error);
          setBackendStops([]);
        }
      }
    };

    void loadBackendStops();

    return () => {
      cancelled = true;
    };
  }, [activeDirectionId, activeLineId]);

  useEffect(() => {
    if (!activeLineId || !activeDirectionId) {
      setBackendPath([]);
      return;
    }

    let cancelled = false;

    const loadBackendPath = async () => {
      try {
        const data = await requestApi<BackendDirectionPathResponse>(
          `/lines/${activeLineId}/directions/${activeDirectionId}/path`,
          undefined,
          { revalidate: 0 }
        );

        if (!cancelled) {
          setBackendPath(Array.isArray(data.path) ? data.path : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(`Falha ao carregar path real de ${activeLineId}/${activeDirectionId} para o mapa.`, error);
          setBackendPath([]);
        }
      }
    };

    void loadBackendPath();

    return () => {
      cancelled = true;
    };
  }, [activeDirectionId, activeLineId]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs text-slate-500">{copy.clickMapHint}</p>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            {copy.availableLines}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
            {copy.activeLine}
          </span>
        </div>
      </div>
      <div className="h-[340px] overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={[center.lat, center.lng]} zoom={12} scrollWheelZoom className="h-full w-full">
          <MapViewportSync points={focusPoints.length ? focusPoints : [center]} />

          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {userLocation ? (
            <>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={500}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.1 }}
              />
              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={8}
                pathOptions={{ color: '#0369a1', fillColor: '#0ea5e9', fillOpacity: 1 }}
              >
                <Popup>
                  <strong>{copy.yourLocation}</strong>
                  <br />
                  {copy.boardingLocationHint}
                </Popup>
              </CircleMarker>
            </>
          ) : null}

          {lines.map((line) => {
            const isActive = line.id === highlightedLineId;
            const path = isActive && activeDirection ? activeDirection.path : line.path;
            const stops = isActive && activeDirection ? activeDirection.stops : line.stops;
            const routeLabel = isActive && activeDirection ? activeDirection.routeLabel : `${line.origin} -> ${line.destination}`;

            return (
              <Fragment key={line.id}>
                <Polyline
                  positions={path.map((point) => [point.lat, point.lng] as [number, number])}
                  pathOptions={{
                    color: line.color,
                    weight: isActive ? 6 : 3,
                    opacity: isActive ? 0.95 : 0.45,
                  }}
                  eventHandlers={{ click: () => onSelectLine?.(line.id) }}
                />
                {stops.map((stop) => {
                  return (
                    <CircleMarker
                      key={stop.id}
                      center={[stop.location.lat, stop.location.lng]}
                      radius={isActive ? 6 : 4}
                      pathOptions={{
                        color: line.color,
                        fillColor: line.color,
                        fillOpacity: 0.95,
                        weight: 1,
                      }}
                      eventHandlers={{ click: () => onSelectLine?.(line.id) }}
                    >
                      <Popup>
                        <strong>
                          {line.code} · {stop.name}
                        </strong>
                        <br />
                        {routeLabel}
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </Fragment>
            );
          })}

          {backendStops.map((stop) => (
            <CircleMarker
              key={`backend-stop-${stop.id}`}
              center={[stop.location.lat, stop.location.lng]}
              radius={7}
              pathOptions={{
                color: '#b45309',
                fillColor: '#f59e0b',
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{stop.name}</strong>
                <br />
                {activeDirectionId ?? 'direction-unavailable'} ? #{stop.sequence}
              </Popup>
            </CircleMarker>
          ))}

          {backendPath.length ? (
            <Polyline
              positions={backendPath.map((point) => [point.lat, point.lng] as [number, number])}
              pathOptions={{
                color: '#d97706',
                weight: 5,
                opacity: 0.9,
              }}
            />
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}
