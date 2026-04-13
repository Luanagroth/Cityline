import type { TransportLine } from '@cityline/shared';

export interface ManualFareSeed {
  label: string;
  riderCategory?: string;
  amountCents?: number;
}

export interface ManualLineSeedConfig {
  inboundOffsetMinutes?: number;
  fareEntries?: ManualFareSeed[];
}

const municipalFare: ManualFareSeed[] = [
  {
    label: 'Tarifa municipal São Francisco do Sul',
    riderCategory: 'integral',
    amountCents: 600,
  },
];

const intermunicipalFare: ManualFareSeed[] = [
  {
    label: 'Tarifa intermunicipal com valor variável por trajeto',
    riderCategory: 'integral',
  },
];

const ferryFare: ManualFareSeed[] = [
  {
    label: 'Pedestre',
    riderCategory: 'pedestre',
    amountCents: 320,
  },
  {
    label: 'Carro',
    riderCategory: 'veiculo',
    amountCents: 2400,
  },
];

export const manualLineSeedConfig: Record<string, ManualLineSeedConfig> = {
  'ferry-01': {
    inboundOffsetMinutes: 0,
    fareEntries: ferryFare,
  },
  'ferry-02': {
    inboundOffsetMinutes: 0,
    fareEntries: ferryFare,
  },
  'line-610': {
    fareEntries: intermunicipalFare,
  },
  'line-620': {
    fareEntries: intermunicipalFare,
  },
};

export const getManualLineSeedConfig = (line: TransportLine): ManualLineSeedConfig => {
  const configured = manualLineSeedConfig[line.id];

  if (configured) {
    return configured;
  }

  if (line.mode === 'ferry') {
    return { inboundOffsetMinutes: 0, fareEntries: ferryFare };
  }

  if (line.mode === 'intercity') {
    return { fareEntries: intermunicipalFare };
  }

  return { fareEntries: municipalFare };
};
