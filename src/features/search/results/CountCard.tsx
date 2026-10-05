import { memo } from 'react';
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber';
import { fmtNum, useI18n } from '../../../i18n';
import { COUNT_CARD } from './countCardStyle';

/** Live count: a big rolling number with tabular figures and a fixed width, so nothing shifts as it changes. */
export const CountCard = memo(function CountCard({ count, ofLine, note }: { count: number | undefined; ofLine: string; note?: string }) {
  const { t } = useI18n();
  const shown = useAnimatedNumber(count ?? 0);
  return (
    <div className={`hidden w-[196px] flex-none flex-col justify-center rounded-xl px-4 py-2.5 lg:flex ${COUNT_CARD}`}>
      <div aria-hidden className="tabular text-[34px] leading-none font-bold tracking-[-0.03em] text-white">
        {count === undefined ? t.noCount : fmtNum(shown)}
      </div>
      <p className="mt-1.5 text-[12.5px] leading-tight font-bold text-on-accent" aria-live="polite" aria-atomic="true">
        <span className="sr-only">{count === undefined ? t.loading : fmtNum(count)} </span>
        {t.countMatch}
      </p>
      <p className="truncate text-[11.5px] leading-tight text-on-accent">{ofLine}</p>
      {note && <p className="mt-0.5 truncate text-[11px] leading-tight font-semibold text-on-accent">★ {note}</p>}
    </div>
  );
});
