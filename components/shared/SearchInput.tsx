// components/shared/SearchInput.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';

export type SearchInputProps = {
  /** pre‑fill from parent (state‑controlled) */
  value?: string;
  /** forward to the native input */
  autoFocus?: boolean;
  /** placeholder shown when empty */
  placeholder?: string;
  /** bubble the current term upward on every keystroke */
  onSearch: (term: string) => void;
};

export default function SearchInput({
  value = '',
  autoFocus,
  placeholder = 'Search…',
  onSearch,
}: SearchInputProps) {
  const [term, setTerm] = useState(value);

  /* keep local state in sync with parent */
  useEffect(() => setTerm(value), [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTerm(v);
    onSearch(v);
  };

  return (
    <input
      autoFocus={autoFocus}
      value={term}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full rounded-md border bg-input px-3 py-2
                 text-sm outline-none focus:border-primary"
    />
  );
}
