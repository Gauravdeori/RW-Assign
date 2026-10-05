import { useCallback, useEffect, useState } from 'react';
import { KEEP_LAST, clearStoredConversions, loadConversions, newConversion, storeConversions } from '../../lib/conversions';
import type { Conversion, ConversionStatus, UploadSettings } from '../../types';

/** Dummy Resume Studio conversions, newest first, trimmed to the last KEEP_LAST, kept in this browser. */
export function useConversions() {
  const [conversions, setConversions] = useState<Conversion[]>(loadConversions);
  useEffect(() => storeConversions(conversions), [conversions]);

  const add = useCallback((file: { name: string; size: number }, settings: UploadSettings): { status: ConversionStatus } => {
    setConversions((list) => [newConversion(list, file, settings), ...list].slice(0, KEEP_LAST));
    // Same rule as newConversion: cross-language conversions wait for review.
    return { status: settings.source === settings.target ? 'exported' : 'review' };
  }, []);
  const remove = useCallback((id: number) => setConversions((list) => list.filter((c) => c.id !== id)), []);
  const restore = useCallback(
    (c: Conversion) => setConversions((list) => [...list, c].sort((a, b) => b.id - a.id).slice(0, KEEP_LAST)),
    [],
  );
  const reset = useCallback(() => {
    clearStoredConversions();
    setConversions(loadConversions());
  }, []);
  return { conversions, add, remove, restore, reset };
}
