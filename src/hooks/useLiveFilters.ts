import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../config';
import type { Filters } from '../types';

type TextPart = Pick<Filters, 'lastName' | 'firstName' | 'currentCompany' | 'previousCompanies' | 'schoolName' | 'qualText'>;
const textOf = (f: Filters): string =>
  JSON.stringify([f.lastName, f.firstName, f.currentCompany, f.previousCompanies, f.schoolName, f.qualText]);
const withText = (f: Filters, key: string): Filters => {
  const [lastName, firstName, currentCompany, previousCompanies, schoolName, qualText] = JSON.parse(key) as [
    string,
    string,
    string,
    string[],
    string,
    string,
  ];
  const text: TextPart = { lastName, firstName, currentCompany, previousCompanies, schoolName, qualText };
  return { ...f, ...text };
};

/**
 * The filters to search with. Clicks apply at once; typing applies CONFIG.textDebounceMs after the last key press.
 * When the whole draft is replaced (new step, trail jump, clear, chip, JD fill) `version` changes and text applies
 * at once.
 */
export function useLiveFilters(f: Filters, version: number): Filters {
  const key = textOf(f);
  const [settled, setSettled] = useState({ key, version });
  useEffect(() => {
    if (settled.key === key || settled.version !== version) return;
    const id = setTimeout(() => setSettled({ key, version }), CONFIG.textDebounceMs);
    return () => clearTimeout(id);
  }, [key, version, settled.key, settled.version]);
  // A replaced draft applies its text at once (no waiting for a settle that the next render would trigger).
  const effectiveKey = settled.version !== version ? key : settled.key;
  if (settled.version !== version) setSettled({ key, version });
  return useMemo(() => withText(f, effectiveKey), [f, effectiveKey]);
}
