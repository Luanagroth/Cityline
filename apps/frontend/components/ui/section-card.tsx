import type { PropsWithChildren, ReactNode } from 'react';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, aside, className = '', children }: SectionCardProps) {
  return (
    <section className={`surface p-4 sm:p-5 ${className}`.trim()}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
