import { useI18n } from '../../../i18n';

/** Gaishi score letter, large, on a red badge in the card's top-right corner. */
export function GaishiBadge({ score, size }: { score: string; size: 'lg' | 'md' }) {
  const { t } = useI18n();
  return (
    <span
      role="img"
      aria-label={t.gaishiBadge(score)}
      title={t.gaishiBadge(score)}
      className={`flex flex-none items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] leading-none font-bold text-white shadow-accent ${
        size === 'lg' ? 'h-11 w-11 text-[28px]' : 'h-9 w-9 text-[22px]'
      }`}
    >
      {score}
    </span>
  );
}
