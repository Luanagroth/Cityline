import type { LineStatus } from '@cityline/shared';
import type { UiLocale } from '@/lib/ui-copy';
import { uiCopy } from '@/lib/ui-copy';

const styles: Record<LineStatus, string> = {
  'on-time': 'bg-sky-100 text-sky-700',
  attention: 'bg-amber-100 text-amber-700',
  reduced: 'bg-rose-100 text-rose-700',
};

export function StatusPill({ status, locale = 'pt-BR' }: { status: LineStatus; locale?: UiLocale }) {
  const copy = uiCopy[locale].labels;
  const label =
    status === 'on-time' ? copy.statusRegular : status === 'attention' ? copy.statusAttention : copy.statusReduced;

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{label}</span>;
}
