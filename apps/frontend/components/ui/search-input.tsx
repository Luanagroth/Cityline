'use client';

import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Busque por linha, numero, bairro ou rota' }: SearchInputProps) {
  return (
    <label className="surface-muted flex items-center gap-2 px-3 py-2">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
