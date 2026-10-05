import { useI18n } from '../i18n';

/** Small red count of active filters on a tab or box heading. Nothing when zero. */
export function CountBadge({ n }: { n: number }) {
  const { t } = useI18n();
  if (!n) return null;
  return (
    <span
      aria-label={t.nSelected(n)}
      className="tabular inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10.5px] font-bold tracking-normal text-on-accent"
    >
      {n}
    </span>
  );
}
