'use client';

import { useMemo } from 'react';
import type { TransportLine } from '@cityline/shared';
import { filterLinesByQuery } from '@/lib/transport';

export function useLineSearch(lines: TransportLine[], query: string) {
  return useMemo(() => filterLinesByQuery(lines, query), [lines, query]);
}
