import { DialogFrame } from '../../../components/DialogFrame';
import { useI18n } from '../../../i18n';
import { savedSummary } from '../../../lib/describe';
import type { SavedSearch } from '../../../types';

/** File > Open saved search (also "Show all" under the saved searches list). */
export function OpenSavedDialog({
  saved,
  onPick,
  onClose,
}: {
  saved: SavedSearch[];
  onPick: (s: SavedSearch) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <DialogFrame title={t.openSavedTitle} onClose={onClose}>
      {saved.length === 0 ? (
        <p className="text-[13px] text-muted">{t.noSavedSearches}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {saved.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => onPick(s)} className="block w-full px-3 py-2.5 text-left hover:bg-pick/60">
                <span className="block truncate text-[13.5px] font-semibold">{s.name}</span>
                <span className="block truncate text-[12px] text-muted">
                  {savedSummary(s, t)}
                  {/^\d{4}-\d{2}-\d{2}$/.test(s.createdAt) && ` · ${t.formatDate(s.createdAt)}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </DialogFrame>
  );
}
