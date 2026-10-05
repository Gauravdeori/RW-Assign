import { InfoPopover } from '../../../../components/InfoPopover';
import { useI18n } from '../../../../i18n';
import { SCHOOL_RATINGS } from '../../../../types';

/** The (i) glossary of school ratings (a sample list, to be confirmed by Robert Walters). */
export function RatingGlossary() {
  const { t } = useI18n();
  return (
    <InfoPopover label={t.ratingInfo}>
      <p className="text-[14px] font-bold">{t.schoolRatingLabel}</p>
      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[12.5px] leading-snug">
        {SCHOOL_RATINGS.map((r) => (
          <div key={r} className="contents">
            <dt className="font-bold text-pick-ink">{t.schoolRating[r]}</dt>
            <dd>{t.ratingGlossary[r]}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2.5 border-t border-line pt-2 text-[11.5px] leading-snug font-semibold text-muted">{t.ratingSample}</p>
    </InfoPopover>
  );
}
