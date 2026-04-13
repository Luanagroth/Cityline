import { describe, expect, it } from 'vitest';
import { collectedBusLineExample, collectedFerryRouteExample } from '@cityline/shared';
import { ingestionService } from './ingestion.service.js';

describe('ingestion service', () => {
  it('normaliza manifests collected em dataset canônico do Cityline', () => {
    const dataset = ingestionService.normalizeCollected({
      lines: [collectedBusLineExample],
      ferryRoutes: [collectedFerryRouteExample],
    });

    expect(dataset.transportLines).toHaveLength(2);
    expect(dataset.routeDirections.some((direction) => direction.id === 'line-100-outbound')).toBe(true);
    expect(dataset.routeDirections.some((direction) => direction.lineId.startsWith('ferry-'))).toBe(true);
    expect(dataset.stops.length).toBeGreaterThanOrEqual(6);
    expect(dataset.lineStops.some((item) => item.directionId === 'line-100-outbound' && item.sequence === 1)).toBe(true);
    expect(dataset.schedules.some((schedule) => schedule.directionId === 'line-100-outbound')).toBe(true);
    expect(dataset.ferrySchedules.some((schedule) => schedule.departureTime === '07:00')).toBe(true);
    expect(dataset.fares.some((fare) => fare.lineId === 'line-100')).toBe(true);
    expect(dataset.ferryFares.some((fare) => fare.lineId.startsWith('ferry-'))).toBe(true);
  });

  it('deduplica paradas por nome e coordenada ao normalizar multiplos manifests', () => {
    const secondLine = {
      ...collectedBusLineExample,
      id: 'collected-line-101',
      code: '101',
      slug: '101-centro-vila-da-gloria',
      name: 'Centro - Vila da Gloria',
      routeLabel: 'Terminal Central -> Vila da Gloria',
      destinationLabel: 'Vila da Gloria',
      directions: [
        {
          ...collectedBusLineExample.directions[0]!,
          id: 'collected-line-101-outbound',
          name: 'Terminal Central -> Vila da Gloria',
          routeLabel: 'Terminal Central -> Vila da Gloria',
          destinationLabel: 'Vila da Gloria',
          stops: [
            collectedBusLineExample.directions[0]!.stops[0]!,
            {
              id: 'collected-stop-101-2',
              name: 'Vila da Gloria',
              sequence: 2,
              location: { lat: -26.1791, lng: -48.7247 },
              isTimingPoint: true,
            },
          ],
          departures: [
            {
              id: 'collected-line-101-weekday-0600',
              serviceDay: 'weekday' as const,
              departureTime: '06:00',
              stopPredictions: [],
            },
          ],
        },
      ],
    };

    const dataset = ingestionService.normalizeCollected({
      lines: [collectedBusLineExample, secondLine],
    });

    const terminalCentralStops = dataset.stops.filter((stop) => stop.name === 'Terminal Central');
    expect(terminalCentralStops).toHaveLength(1);
  });
});
