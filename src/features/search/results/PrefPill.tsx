import { useI18n } from '../../../i18n';

/** "★ 2/3": how many of the nice-to-have filters this candidate matches. Red when all of them. */
export function PrefPill({ n, total }: { n: number; total: number }) {
  const { t } = useI18n();
  const all = n === total;
  return (
    <span
      title={t.prefMatch(n, total)}
      className={`inline-flex h-[17px] flex-none items-center rounded-full border px-1.5 text-[10.5px] leading-none font-semibold ${
        all ? 'border-pick-line bg-pick text-pick-ink' : n ? 'border-accent/40 text-pick-ink' : 'border-line text-muted'
      }`}
    >
      <span aria-hidden>
        ★ {n}/{total}
      </span>
      <span className="sr-only">{t.prefMatch(n, total)}</span>
    </span>
  );
}
