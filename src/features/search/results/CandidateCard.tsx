import { memo } from 'react';
import { useI18n } from '../../../i18n';
import { topEducation } from '../../../lib/candidate';
import type { Candidate, CardVariant, Density } from '../../../types';
import { CardFact } from './CardFact';
import { CARD_H } from './cardSizes';
import { CvThumb } from './CvThumb';
import { GaishiBadge } from './GaishiBadge';
import { PrefPill } from './PrefPill';

/**
 * One result as a card of fixed height.
 * - "row" (1-column view): name with the details line beside it, role, five key facts in one line, CV thumbnail,
 *   and the gaishi letter large in the top-right corner.
 * - "tile" (3-column view, default): the same facts in five short lines, as tall as a compact row, so a
 *   page shows 3 columns by 5 rows.
 * Memoised: re-renders only when its candidate, layout or language changes.
 */
export const CandidateCard = memo(function CandidateCard({
  c,
  variant,
  density,
  prefN,
  prefTotal,
  onOpenCv,
}: {
  c: Candidate;
  variant: CardVariant;
  density: Density;
  /** Nice-to-have filters matched, out of prefTotal (0 total = none in use). */
  prefN: number;
  prefTotal: number;
  onOpenCv: (c: Candidate) => void;
}) {
  const { t } = useI18n();
  const name = t.displayName(c);
  const top = topEducation(c);
  const school = top ? t.schoolWithRating(top.school, top.schoolRating) : t.schoolNone;
  const roomy = density === 'comfortable';
  const openCv = (
    <button
      type="button"
      onClick={() => onOpenCv(c)}
      aria-label={t.openCvFor(name)}
      className="text-[12px] whitespace-nowrap underline underline-offset-2 hover:text-accent"
    >
      {t.openCv}
    </button>
  );

  if (variant === 'tile') {
    const en = `${t.factEnglishShort} ${t.level[c.englishLevel]}`;
    const jp = `${t.factJapaneseShort} ${t.level[c.japaneseLevel]}`;
    const factLine = [`${t.factAge} ${c.age}`, t.seniorityFact(c.seniority), en, jp].join(' · ');
    return (
      <article
        className={`anim-fade-up flex flex-col overflow-hidden rounded-xl border border-line bg-card px-3.5 shadow-card hover:border-accent/40 hover:shadow-hover ${roomy ? 'py-3' : 'py-2'}`}
        style={{ height: CARD_H.tile[density] }}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[14.5px] leading-[18px] font-bold tracking-[-0.01em]">{name}</h2>
            <p className="truncate text-[12.5px] leading-[16px] font-medium">{t.titleAt(c)}</p>
          </div>
          <GaishiBadge score={c.gaishiScore} size="md" />
        </div>
        <p className="flex items-center gap-1.5 text-[11.5px] leading-[15px] text-muted">
          {prefTotal > 0 && <PrefPill n={prefN} total={prefTotal} />}
          <span className="min-w-0 truncate">{t.cardMeta(c)}</span>
        </p>
        <div className={`text-[12px] leading-[15px] ${roomy ? 'mt-2' : 'mt-1'}`}>
          <dl>
            <div className="truncate" title={factLine}>
              <dt className="sr-only">{`${t.factAge}, ${t.factSeniority}, ${t.factEnglish}, ${t.factJapanese}`}</dt>
              <dd className="inline font-medium">{factLine}</dd>
            </div>
          </dl>
          <div className="flex items-baseline gap-2">
            <dl className="min-w-0 flex-1">
              <dt className="sr-only">{t.factSchool}</dt>
              <dd className="truncate text-muted" title={school}>
                {school}
              </dd>
            </dl>
            {openCv}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`anim-fade-up flex gap-4 overflow-hidden rounded-xl border border-line bg-card px-4 shadow-card hover:border-accent/40 hover:shadow-hover ${roomy ? 'py-3.5' : 'py-2.5'}`}
      style={{ height: CARD_H.row[density] }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-4">
          <h2 className="max-w-[55%] flex-none truncate text-[16px] leading-[20px] font-bold tracking-[-0.01em]">{name}</h2>
          {prefTotal > 0 && (
            <span className="-ml-2 self-center">
              <PrefPill n={prefN} total={prefTotal} />
            </span>
          )}
          <p className="ml-auto min-w-0 truncate text-right text-[12px] leading-[16px] text-muted">{t.cardMeta(c)}</p>
        </div>
        <p className="mt-0.5 truncate text-[13px] leading-[18px] font-medium">{t.titleAt(c)}</p>
        <dl className={`grid grid-cols-5 gap-x-4 ${roomy ? 'mt-3' : 'mt-2'}`}>
          <CardFact label={t.factAge}>{c.age}</CardFact>
          <CardFact label={t.factSeniority}>{t.seniorityFact(c.seniority)}</CardFact>
          <CardFact label={t.factEnglish}>{t.level[c.englishLevel]}</CardFact>
          <CardFact label={t.factJapanese}>{t.level[c.japaneseLevel]}</CardFact>
          <CardFact label={t.factSchool} title={school}>
            {school}
          </CardFact>
        </dl>
      </div>
      <div className="flex flex-none flex-col items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenCv(c)}
          aria-label={t.openCvFor(name)}
          tabIndex={-1}
          className="group/thumb block rounded"
        >
          <CvThumb className="h-[52px] w-[42px]" />
        </button>
        {openCv}
      </div>
      <GaishiBadge score={c.gaishiScore} size="lg" />
    </article>
  );
});
