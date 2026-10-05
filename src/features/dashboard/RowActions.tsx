import { TrashIcon } from '../../components/icons/TrashIcon';
import type { Conversion } from '../../types';
import { useStudioLabels } from './useStudioLabels';

/** Edit and Delete buttons for one conversion. */
export function RowActions({ c, onEdit, onDelete }: { c: Conversion; onEdit: () => void; onDelete: () => void }) {
  const { s } = useStudioLabels();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        aria-label={s.editFor(c.fileName)}
        className="h-10 rounded-full border border-card-line bg-card px-4 text-[13px] font-semibold hover:border-ink/50"
      >
        {s.edit}
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={s.deleteFor(c.fileName)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-card-line bg-card hover:border-accent hover:text-accent"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
