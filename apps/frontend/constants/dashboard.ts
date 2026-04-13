export const DASHBOARD_TABS = [
  { id: 'all', label: 'Todas as linhas' },
  { id: 'favorites', label: 'Favoritas' },
  { id: 'ferry', label: 'Ferry boat' },
  { id: 'map', label: 'Mapa' },
] as const;

export const TRANSPORT_MODE_OPTIONS = [
  { id: 'all', label: 'Tudo' },
  { id: 'urban', label: 'Urbano' },
  { id: 'intercity', label: 'Intermunicipal' },
  { id: 'ferry', label: 'Ferry' },
] as const;

export const DAY_OPTIONS = [
  { id: 'weekday', label: 'Dia util' },
  { id: 'saturday', label: 'Sabado' },
  { id: 'sunday', label: 'Domingo' },
] as const;
