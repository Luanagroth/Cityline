import { describe, expect, it } from 'vitest';
import type { ScheduleEntry, ServiceDay } from '@cityline/shared';
import { differenceInMinutes, parseTimeToMinutes, selectNextDepartures } from './transport-schedule.utils.js';

const makeSchedule = (time: string, dayType: ServiceDay): ScheduleEntry => ({
  id: `${dayType}-${time}`,
  time,
  dayType,
  isPeak: false,
  occupancy: 'medium',
});

describe('transport schedule utils', () => {
  it('converte horario para minutos corretamente', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('06:30')).toBe(390);
  });

  it('calcula a diferenca em minutos para uma partida no mesmo dia', () => {
    expect(differenceInMinutes('06:20', new Date('2026-03-30T06:05:00'))).toBe(15);
    expect(differenceInMinutes('06:20', new Date('2026-03-30T06:20:00'))).toBe(0);
  });

  it('seleciona proximas partidas do dia com status amigavel', () => {
    const schedules = {
      weekday: [makeSchedule('06:20', 'weekday'), makeSchedule('06:40', 'weekday'), makeSchedule('07:10', 'weekday')],
      saturday: [],
      sunday: [],
    };

    const result = selectNextDepartures(schedules, 'weekday', new Date('2026-03-30T06:19:00'), 2);

    expect(result.hasDeparturesToday).toBe(true);
    expect(result.summary).toBe('saida agora');
    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.status).toBe('now');
    expect(result.items[1]?.label).toBe('partida em 21 minutos');
  });

  it('informa proxima saida amanha quando nao ha mais viagens hoje', () => {
    const schedules = {
      weekday: [makeSchedule('05:30', 'weekday')],
      saturday: [makeSchedule('06:10', 'saturday')],
      sunday: [],
    };

    const result = selectNextDepartures(schedules, 'weekday', new Date('2026-04-03T23:00:00'));

    expect(result.hasDeparturesToday).toBe(false);
    expect(result.summary).toContain('proxima saida amanha');
    expect(result.items[0]?.dayType).toBe('saturday');
    expect(result.items[0]?.isTomorrow).toBe(true);
  });
});
