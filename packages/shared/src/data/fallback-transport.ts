import type { GeoPoint, ScheduleEntry, ServiceDay, TransportLine } from '../types/transport.js';

const updatedAt = '2026-03-30T22:30:00.000Z';

const makeSchedules = (times: string[], dayType: ServiceDay): ScheduleEntry[] =>
  times.map((time, index) => ({
    id: `${dayType}-${time}`,
    time,
    dayType,
    isPeak: ['06', '07', '08', '17', '18'].some((prefix) => time.startsWith(prefix)),
    occupancy: index < 2 ? 'high' : index < 5 ? 'medium' : 'low',
    platform: `P${(index % 3) + 1}`,
  }));

const center: GeoPoint = { lat: -26.2429, lng: -48.6384 };

export const cityMapCenter = center;

export const fallbackLines: TransportLine[] = [
  {
    id: 'line-100',
    code: '100',
    name: 'Centro ↔ Praia Grande',
    operator: 'Verdes Mares',
    routeLabel: 'Terminal Central → Praia Grande',
    summary: 'Linha urbana de alta procura ligando o centro histórico às praias com reforço nos horários de pico.',
    origin: 'Terminal Central',
    destination: 'Praia Grande',
    estimatedDurationMinutes: 28,
    distanceKm: 11.2,
    color: '#0f766e',
    status: 'on-time',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'wifi', 'bike rack'],
    updatedAt,
    stops: [
      { id: '100-1', name: 'Terminal Central', sequence: 1, location: { lat: -26.2429, lng: -48.6384 } },
      { id: '100-2', name: 'Mercado Público', sequence: 2, location: { lat: -26.2407, lng: -48.6348 } },
      { id: '100-3', name: 'Enseada', sequence: 3, location: { lat: -26.2205, lng: -48.5903 } },
      { id: '100-4', name: 'Praia Grande', sequence: 4, location: { lat: -26.2046, lng: -48.5409 } }
    ],
    path: [
      { lat: -26.2429, lng: -48.6384 },
      { lat: -26.2381, lng: -48.6261 },
      { lat: -26.2303, lng: -48.6110 },
      { lat: -26.2205, lng: -48.5903 },
      { lat: -26.2124, lng: -48.5651 },
      { lat: -26.2046, lng: -48.5409 }
    ],
    schedules: {
      weekday: makeSchedules(['05:30', '05:50', '06:20', '06:50', '07:20', '08:10', '09:30', '12:15', '14:30', '16:20', '17:10', '18:20', '19:10', '20:00'], 'weekday'),
      saturday: makeSchedules(['06:30', '07:30', '08:00', '10:00', '12:00', '13:00', '16:00', '19:00'], 'saturday'),
      sunday: makeSchedules(['07:30', '09:30', '12:00', '15:00', '18:00'], 'sunday')
    }
  },
  {
    id: 'line-101',
    code: '101',
    name: 'Centro ↔ Vila da Glória',
    operator: 'Verdes Mares',
    routeLabel: 'Terminal Central → Vila da Glória',
    summary: 'Integra o centro à Vila da Glória e ao terminal hidroviário, útil para conexões urbanas e marítimas.',
    origin: 'Terminal Central',
    destination: 'Vila da Glória',
    estimatedDurationMinutes: 35,
    distanceKm: 14.8,
    color: '#2563eb',
    status: 'attention',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'ar-condicionado', 'integração ferry'],
    updatedAt,
    stops: [
      { id: '101-1', name: 'Terminal Central', sequence: 1, location: { lat: -26.2429, lng: -48.6384 } },
      { id: '101-2', name: 'Hospital Municipal', sequence: 2, location: { lat: -26.2351, lng: -48.6521 } },
      { id: '101-3', name: 'Forte Marechal', sequence: 3, location: { lat: -26.2095, lng: -48.6918 } },
      { id: '101-4', name: 'Vila da Glória', sequence: 4, location: { lat: -26.1791, lng: -48.7247 } }
    ],
    path: [
      { lat: -26.2429, lng: -48.6384 },
      { lat: -26.2393, lng: -48.6490 },
      { lat: -26.2288, lng: -48.6691 },
      { lat: -26.2095, lng: -48.6918 },
      { lat: -26.1942, lng: -48.7071 },
      { lat: -26.1791, lng: -48.7247 }
    ],
    schedules: {
      weekday: makeSchedules(['05:45', '06:00', '06:40', '07:20', '08:00', '09:00', '12:20', '14:20', '16:40', '18:00', '19:10', '20:20'], 'weekday'),
      saturday: makeSchedules(['07:00', '08:30', '11:00', '14:00', '17:00', '19:30'], 'saturday'),
      sunday: makeSchedules(['08:00', '10:00', '13:00', '16:00', '18:30'], 'sunday')
    }
  },
  {
    id: 'line-210',
    code: '210',
    name: 'Paulas ↔ Centro Histórico',
    operator: 'Verdes Mares',
    routeLabel: 'Paulas → Centro Histórico',
    summary: 'Eixo residencial com boa frequência para deslocamento diário e acesso ao comércio central.',
    origin: 'Paulas',
    destination: 'Centro Histórico',
    estimatedDurationMinutes: 18,
    distanceKm: 6.1,
    color: '#9333ea',
    status: 'on-time',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível'],
    updatedAt,
    stops: [
      { id: '210-1', name: 'Paulas', sequence: 1, location: { lat: -26.2201, lng: -48.6531 } },
      { id: '210-2', name: 'Laranjeiras', sequence: 2, location: { lat: -26.2278, lng: -48.6462 } },
      { id: '210-3', name: 'Mercado Público', sequence: 3, location: { lat: -26.2407, lng: -48.6348 } },
      { id: '210-4', name: 'Centro Histórico', sequence: 4, location: { lat: -26.2438, lng: -48.6389 } }
    ],
    path: [
      { lat: -26.2201, lng: -48.6531 },
      { lat: -26.2247, lng: -48.6499 },
      { lat: -26.2318, lng: -48.6430 },
      { lat: -26.2386, lng: -48.6374 },
      { lat: -26.2438, lng: -48.6389 }
    ],
    schedules: {
      weekday: makeSchedules(['05:40', '06:10', '06:45', '07:15', '07:50', '11:45', '13:10', '16:30', '17:20', '18:10', '19:30', '20:10'], 'weekday'),
      saturday: makeSchedules(['06:30', '08:00', '10:30', '13:30', '16:30', '18:30'], 'saturday'),
      sunday: makeSchedules(['07:30', '10:00', '13:00', '16:00', '18:00'], 'sunday')
    }
  },
  {
    id: 'line-310',
    code: '310',
    name: 'Ubatuba ↔ Terminal Central',
    operator: 'Verdes Mares',
    routeLabel: 'Ubatuba → Terminal Central',
    summary: 'Corredor entre áreas costeiras, comércio e terminal urbano, incluindo Ubatuba, Capri e Enseada.',
    origin: 'Ubatuba',
    destination: 'Terminal Central',
    estimatedDurationMinutes: 24,
    distanceKm: 9.4,
    color: '#ea580c',
    status: 'reduced',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'bike rack'],
    updatedAt,
    stops: [
      { id: '310-1', name: 'Ubatuba', sequence: 1, location: { lat: -26.2226, lng: -48.5635 } },
      { id: '310-2', name: 'Capri', sequence: 2, location: { lat: -26.2214, lng: -48.5874 } },
      { id: '310-3', name: 'Enseada', sequence: 3, location: { lat: -26.2205, lng: -48.5903 } },
      { id: '310-4', name: 'Terminal Central', sequence: 4, location: { lat: -26.2429, lng: -48.6384 } }
    ],
    path: [
      { lat: -26.2226, lng: -48.5635 },
      { lat: -26.2221, lng: -48.5760 },
      { lat: -26.2214, lng: -48.5874 },
      { lat: -26.2205, lng: -48.5903 },
      { lat: -26.2291, lng: -48.6112 },
      { lat: -26.2429, lng: -48.6384 }
    ],
    schedules: {
      weekday: makeSchedules(['05:50', '06:10', '06:50', '07:40', '08:30', '09:10', '12:40', '15:00', '17:00', '18:30', '20:30'], 'weekday'),
      saturday: makeSchedules(['07:00', '09:00', '12:00', '15:00', '18:00'], 'saturday'),
      sunday: makeSchedules(['08:30', '11:30', '14:30', '17:30'], 'sunday')
    }
  },
  {
    id: 'line-330',
    code: '330',
    name: 'Centro ↔ Capri / Enseada',
    operator: 'Verdes Mares',
    routeLabel: 'Terminal Central → Capri → Enseada',
    summary: 'Atende o eixo turístico e residencial do Capri com reforço de saídas no período de praia e finais de semana.',
    origin: 'Terminal Central',
    destination: 'Capri / Enseada',
    estimatedDurationMinutes: 30,
    distanceKm: 10.7,
    color: '#06b6d4',
    status: 'on-time',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'praias', 'fim de semana'],
    updatedAt,
    stops: [
      { id: '330-1', name: 'Terminal Central', sequence: 1, location: { lat: -26.2429, lng: -48.6384 } },
      { id: '330-2', name: 'Paulas', sequence: 2, location: { lat: -26.2201, lng: -48.6531 } },
      { id: '330-3', name: 'Capri', sequence: 3, location: { lat: -26.2214, lng: -48.5874 } },
      { id: '330-4', name: 'Enseada', sequence: 4, location: { lat: -26.2205, lng: -48.5903 } }
    ],
    path: [
      { lat: -26.2429, lng: -48.6384 },
      { lat: -26.2330, lng: -48.6280 },
      { lat: -26.2258, lng: -48.6118 },
      { lat: -26.2214, lng: -48.5874 },
      { lat: -26.2205, lng: -48.5903 }
    ],
    schedules: {
      weekday: makeSchedules(['06:15', '07:00', '07:45', '08:30', '10:00', '12:30', '15:30', '17:30', '18:45'], 'weekday'),
      saturday: makeSchedules(['07:30', '09:00', '11:00', '13:30', '16:30', '19:00'], 'saturday'),
      sunday: makeSchedules(['08:00', '10:30', '13:00', '16:00', '18:30'], 'sunday')
    }
  },
  {
    id: 'line-610',
    code: '610',
    name: 'São Francisco do Sul ↔ Araquari',
    operator: 'Verdes Mares',
    routeLabel: 'Terminal Central → Araquari',
    summary: 'Linha intermunicipal para deslocamento de trabalho e estudo com conexão via BR-280.',
    origin: 'São Francisco do Sul',
    destination: 'Araquari',
    estimatedDurationMinutes: 45,
    distanceKm: 28.4,
    color: '#1d4ed8',
    status: 'on-time',
    mode: 'intercity',
    fareLabel: 'Tarifa intermunicipal',
    amenities: ['intermunicipal', 'bagageiro', 'acessível'],
    updatedAt,
    stops: [
      { id: '610-1', name: 'Terminal Central', sequence: 1, location: { lat: -26.2429, lng: -48.6384 } },
      { id: '610-2', name: 'BR-280 / Itinga', sequence: 2, location: { lat: -26.2538, lng: -48.7410 } },
      { id: '610-3', name: 'Araquari Centro', sequence: 3, location: { lat: -26.3755, lng: -48.7188 } },
      { id: '610-4', name: 'Terminal Araquari', sequence: 4, location: { lat: -26.3768, lng: -48.7215 } }
    ],
    path: [
      { lat: -26.2429, lng: -48.6384 },
      { lat: -26.2454, lng: -48.6810 },
      { lat: -26.2538, lng: -48.7410 },
      { lat: -26.3112, lng: -48.7378 },
      { lat: -26.3768, lng: -48.7215 }
    ],
    schedules: {
      weekday: makeSchedules(['05:15', '06:00', '06:45', '07:30', '09:00', '11:30', '13:00', '15:30', '17:15', '18:30', '20:00'], 'weekday'),
      saturday: makeSchedules(['06:30', '08:00', '10:00', '12:30', '15:00', '18:00'], 'saturday'),
      sunday: makeSchedules(['07:30', '10:30', '13:30', '17:00'], 'sunday')
    }
  },
  {
    id: 'line-620',
    code: '620',
    name: 'São Francisco do Sul ↔ Joinville',
    operator: 'Verdes Mares',
    routeLabel: 'Terminal Central → Joinville',
    summary: 'Conexão intermunicipal entre São Francisco do Sul e Joinville, ideal para trabalho, estudos e integração regional.',
    origin: 'São Francisco do Sul',
    destination: 'Joinville',
    estimatedDurationMinutes: 70,
    distanceKm: 51.6,
    color: '#0f766e',
    status: 'attention',
    mode: 'intercity',
    fareLabel: 'Tarifa intermunicipal',
    amenities: ['intermunicipal', 'bagageiro', 'ar-condicionado'],
    updatedAt,
    stops: [
      { id: '620-1', name: 'Terminal Central', sequence: 1, location: { lat: -26.2429, lng: -48.6384 } },
      { id: '620-2', name: 'Araquari Centro', sequence: 2, location: { lat: -26.3768, lng: -48.7215 } },
      { id: '620-3', name: 'Terminal Tupy', sequence: 3, location: { lat: -26.3113, lng: -48.8434 } },
      { id: '620-4', name: 'Terminal Joinville', sequence: 4, location: { lat: -26.3045, lng: -48.8466 } }
    ],
    path: [
      { lat: -26.2429, lng: -48.6384 },
      { lat: -26.2712, lng: -48.6992 },
      { lat: -26.3768, lng: -48.7215 },
      { lat: -26.3380, lng: -48.8013 },
      { lat: -26.3045, lng: -48.8466 }
    ],
    schedules: {
      weekday: makeSchedules(['04:50', '05:40', '06:20', '07:10', '08:30', '10:00', '12:00', '14:00', '16:00', '17:40', '19:20', '21:00'], 'weekday'),
      saturday: makeSchedules(['06:00', '08:00', '10:30', '13:00', '16:00', '19:00'], 'saturday'),
      sunday: makeSchedules(['07:00', '10:00', '14:00', '18:00'], 'sunday')
    }
  },
  {
    id: 'ferry-01',
    code: 'FB-01',
    name: 'Ferry Laranjeiras ↔ Vila da Glória',
    operator: 'Ferry Boat Babitonga',
    routeLabel: 'Laranjeiras ↔ Vila da Glória',
    summary: 'Travessia hidroviária pública pela Baía da Babitonga, conectando Laranjeiras e Vila da Glória.',
    origin: 'Laranjeiras',
    destination: 'Vila da Glória',
    estimatedDurationMinutes: 20,
    distanceKm: 4.3,
    color: '#0891b2',
    status: 'on-time',
    mode: 'ferry',
    fareLabel: 'Pedestre R$ 3,20 · Carro R$ 24,00',
    amenities: ['hidroviário', 'travessia', 'veículos', 'pedestres'],
    updatedAt,
    stops: [
      { id: 'f01-1', name: 'Trapiche Laranjeiras', sequence: 1, location: { lat: -26.2760, lng: -48.6728 } },
      { id: 'f01-2', name: 'Trapiche Vila da Glória', sequence: 2, location: { lat: -26.1791, lng: -48.7247 } }
    ],
    path: [
      { lat: -26.2760, lng: -48.6728 },
      { lat: -26.2500, lng: -48.6880 },
      { lat: -26.2230, lng: -48.7035 },
      { lat: -26.1791, lng: -48.7247 }
    ],
    schedules: {
      weekday: makeSchedules(['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:30', '18:30'], 'weekday'),
      saturday: makeSchedules(['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:30', '18:30'], 'saturday'),
      sunday: makeSchedules(['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:30', '18:30'], 'sunday')
    }
  },
  {
    id: 'ferry-02',
    code: 'FB-02',
    name: 'Ferry Joinville ↔ Vila da Glória',
    operator: 'Ferry Boat Babitonga',
    routeLabel: 'Joinville ↔ Vila da Glória',
    summary: 'Travessia hidroviária com horários públicos regulares e integração regional com a Vila da Glória.',
    origin: 'Joinville Ferry',
    destination: 'Vila da Glória',
    estimatedDurationMinutes: 25,
    distanceKm: 6.8,
    color: '#0284c7',
    status: 'on-time',
    mode: 'ferry',
    fareLabel: 'Pedestre R$ 3,20 · Carro R$ 24,00',
    amenities: ['hidroviário', 'travessia', 'veículos', 'pedestres'],
    updatedAt,
    stops: [
      { id: 'f02-1', name: 'Trapiche Joinville', sequence: 1, location: { lat: -26.2525, lng: -48.7810 } },
      { id: 'f02-2', name: 'Trapiche Vila da Glória', sequence: 2, location: { lat: -26.1791, lng: -48.7247 } }
    ],
    path: [
      { lat: -26.2525, lng: -48.7810 },
      { lat: -26.2370, lng: -48.7650 },
      { lat: -26.2160, lng: -48.7470 },
      { lat: -26.1791, lng: -48.7247 }
    ],
    schedules: {
      weekday: makeSchedules(['06:00', '06:20', '07:30', '08:00', '09:00', '09:30', '11:00', '11:30', '12:30', '13:00', '14:00', '14:30', '16:00', '16:30', '18:00', '18:30', '19:45', '20:00', '21:20', '21:40'], 'weekday'),
      saturday: makeSchedules(['06:00', '06:20', '07:30', '08:00', '09:00', '09:30', '11:00', '11:30', '12:30', '13:00', '14:00', '14:30', '16:00', '16:30', '18:00', '18:30', '19:45', '20:00'], 'saturday'),
      sunday: makeSchedules(['07:30', '08:00', '09:30', '11:00', '11:30', '13:00', '14:30', '16:30', '18:30', '20:00'], 'sunday')
    }
  },
  {
    id: 'line-104',
    code: '0104',
    name: 'Enseada via Forte / Capri',
    operator: 'Verdes Mares',
    routeLabel: 'Praça Getúlio Vargas 272 → Ponto Final Enseada',
    summary: 'Variante urbana baseada no catálogo público da Verdes Mares, cobrindo Forte, Capri e acesso às praias da Enseada.',
    origin: 'Praça Getúlio Vargas 272',
    destination: 'Ponto Final Enseada',
    estimatedDurationMinutes: 57,
    distanceKm: 16.2,
    color: '#7c3aed',
    status: 'on-time',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'praias', 'conexão bairro-centro'],
    updatedAt,
    stops: [
      { id: '104-1', name: 'Praça Getúlio Vargas 272', sequence: 1, location: { lat: -26.2438, lng: -48.6389 } },
      { id: '104-2', name: 'Rua Barão do Rio Branco 730', sequence: 2, location: { lat: -26.2388, lng: -48.6356 } },
      { id: '104-3', name: 'Rodovia Duque de Caxias 7440', sequence: 3, location: { lat: -26.2198, lng: -48.6094 } },
      { id: '104-4', name: 'Estrada do Forte 4378', sequence: 4, location: { lat: -26.2103, lng: -48.5791 } },
      { id: '104-5', name: 'Capri', sequence: 5, location: { lat: -26.2214, lng: -48.5874 } },
      { id: '104-6', name: 'Ponto Final Enseada', sequence: 6, location: { lat: -26.2205, lng: -48.5903 } }
    ],
    path: [
      { lat: -26.2438, lng: -48.6389 },
      { lat: -26.2385, lng: -48.6315 },
      { lat: -26.2292, lng: -48.6182 },
      { lat: -26.2198, lng: -48.6094 },
      { lat: -26.2142, lng: -48.5908 },
      { lat: -26.2214, lng: -48.5874 },
      { lat: -26.2205, lng: -48.5903 }
    ],
    schedules: {
      weekday: makeSchedules(['06:00', '06:45', '07:30', '08:20', '10:10', '12:20', '15:00', '17:15', '18:40', '20:10'], 'weekday'),
      saturday: makeSchedules(['06:30', '08:00', '10:30', '13:00', '16:00', '18:30'], 'saturday'),
      sunday: makeSchedules(['07:30', '10:00', '13:00', '16:30', '19:00'], 'sunday')
    }
  },
  {
    id: 'line-107',
    code: '0107',
    name: 'Enseada via Hospital',
    operator: 'Verdes Mares',
    routeLabel: 'Hospital Municipal → Ponto Final Enseada',
    summary: 'Linha urbana com atendimento ao eixo hospitalar e ligação direta com as praias da Enseada.',
    origin: 'Hospital Municipal',
    destination: 'Ponto Final Enseada',
    estimatedDurationMinutes: 51,
    distanceKm: 14.3,
    color: '#db2777',
    status: 'attention',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'hospital', 'bairro-centro'],
    updatedAt,
    stops: [
      { id: '107-1', name: 'Hospital Municipal', sequence: 1, location: { lat: -26.2351, lng: -48.6521 } },
      { id: '107-2', name: 'Praça Getúlio Vargas 272', sequence: 2, location: { lat: -26.2438, lng: -48.6389 } },
      { id: '107-3', name: 'Rodovia Duque de Caxias 2962', sequence: 3, location: { lat: -26.2240, lng: -48.6124 } },
      { id: '107-4', name: 'Parada Secretaria de Obras das Praias', sequence: 4, location: { lat: -26.2144, lng: -48.5822 } },
      { id: '107-5', name: 'Ponto Final Enseada', sequence: 5, location: { lat: -26.2205, lng: -48.5903 } }
    ],
    path: [
      { lat: -26.2351, lng: -48.6521 },
      { lat: -26.2410, lng: -48.6440 },
      { lat: -26.2364, lng: -48.6294 },
      { lat: -26.2240, lng: -48.6124 },
      { lat: -26.2144, lng: -48.5822 },
      { lat: -26.2205, lng: -48.5903 }
    ],
    schedules: {
      weekday: makeSchedules(['05:50', '06:40', '07:25', '08:15', '09:45', '12:00', '14:20', '16:10', '17:45', '19:10'], 'weekday'),
      saturday: makeSchedules(['06:20', '08:20', '10:50', '13:20', '16:20', '18:40'], 'saturday'),
      sunday: makeSchedules(['07:30', '10:30', '13:30', '16:30'], 'sunday')
    }
  },
  {
    id: 'line-116',
    code: '0116',
    name: 'IFC',
    operator: 'Verdes Mares',
    routeLabel: 'Centro Histórico → Campus IFC',
    summary: 'Atendimento de estudantes e servidores com conexão entre o centro histórico e o campus IFC.',
    origin: 'Centro Histórico',
    destination: 'Campus IFC',
    estimatedDurationMinutes: 32,
    distanceKm: 9.8,
    color: '#0d9488',
    status: 'on-time',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'educação', 'dias úteis'],
    updatedAt,
    stops: [
      { id: '116-1', name: 'Centro Histórico', sequence: 1, location: { lat: -26.2438, lng: -48.6389 } },
      { id: '116-2', name: 'Mercado Público', sequence: 2, location: { lat: -26.2407, lng: -48.6348 } },
      { id: '116-3', name: 'Parada Campus I.F.C.', sequence: 3, location: { lat: -26.2136, lng: -48.5966 } },
      { id: '116-4', name: 'Campus IFC', sequence: 4, location: { lat: -26.2108, lng: -48.5929 } }
    ],
    path: [
      { lat: -26.2438, lng: -48.6389 },
      { lat: -26.2376, lng: -48.6288 },
      { lat: -26.2286, lng: -48.6146 },
      { lat: -26.2202, lng: -48.6062 },
      { lat: -26.2136, lng: -48.5966 },
      { lat: -26.2108, lng: -48.5929 }
    ],
    schedules: {
      weekday: makeSchedules(['06:15', '07:05', '07:55', '11:40', '12:25', '13:10', '17:20', '18:10', '22:05'], 'weekday'),
      saturday: makeSchedules(['07:00', '09:00', '12:00', '16:00'], 'saturday'),
      sunday: makeSchedules(['08:30', '13:30', '18:30'], 'sunday')
    }
  },
  {
    id: 'line-118',
    code: '0118',
    name: 'Forte',
    operator: 'Verdes Mares',
    routeLabel: 'Praça Getúlio Vargas 272 → Estrada do Forte',
    summary: 'Ligação direta entre o centro e a região do Forte, com cobertura ampliada no eixo litorâneo.',
    origin: 'Praça Getúlio Vargas 272',
    destination: 'Estrada do Forte',
    estimatedDurationMinutes: 41,
    distanceKm: 12.7,
    color: '#f59e0b',
    status: 'on-time',
    mode: 'urban',
    fareLabel: 'Tarifa urbana municipal',
    amenities: ['acessível', 'bairro-centro'],
    updatedAt,
    stops: [
      { id: '118-1', name: 'Praça Getúlio Vargas 272', sequence: 1, location: { lat: -26.2438, lng: -48.6389 } },
      { id: '118-2', name: 'Rua Marcílio Dias 757', sequence: 2, location: { lat: -26.2416, lng: -48.6360 } },
      { id: '118-3', name: 'Rodovia Duque de Caxias 6536', sequence: 3, location: { lat: -26.2176, lng: -48.6010 } },
      { id: '118-4', name: 'Estrada do Forte 1046', sequence: 4, location: { lat: -26.2123, lng: -48.5848 } },
      { id: '118-5', name: 'Estrada do Forte 4378', sequence: 5, location: { lat: -26.2103, lng: -48.5791 } }
    ],
    path: [
      { lat: -26.2438, lng: -48.6389 },
      { lat: -26.2388, lng: -48.6318 },
      { lat: -26.2300, lng: -48.6186 },
      { lat: -26.2210, lng: -48.6068 },
      { lat: -26.2123, lng: -48.5848 },
      { lat: -26.2103, lng: -48.5791 }
    ],
    schedules: {
      weekday: makeSchedules(['05:45', '06:30', '07:10', '08:00', '11:00', '12:30', '15:10', '17:00', '18:20', '20:00'], 'weekday'),
      saturday: makeSchedules(['06:40', '08:40', '11:40', '14:40', '17:40'], 'saturday'),
      sunday: makeSchedules(['08:00', '11:00', '15:00', '18:00'], 'sunday')
    }
  }
];
