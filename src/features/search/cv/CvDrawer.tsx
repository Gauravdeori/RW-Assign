import { useId, useRef } from 'react';
import { Modal } from '../../../components/Modal';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useI18n } from '../../../i18n';
import { api } from '../../../lib/api';
import type { Candidate } from '../../../types';
import { CvSection } from './CvSection';

/**
 * CV preview as a right-side drawer over the results. Esc or × closes it; the results keep their scroll position.
 * Shows the result card's data at once and the full CV from the API as soon as it arrives.
 * Loaded on demand (React.lazy) the first time a CV is opened. `complete`: the CV passed in is already the full one
 * (Assignment page sample data), so nothing is fetched.
 */
export default function CvDrawer({ summary, onClose, complete = false }: { summary: Candidate; onClose: () => void; complete?: boolean }) {
  const { t } = useI18n();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const cv = useApiQuery(complete ? null : `cv|${summary.id}`, () => api.getCv(summary.id));
  const c = cv.data?.id === summary.id ? cv.data : summary;

  const jobs = [
    { title: c.currentTitle, company: c.currentCompany, years: t.toPresent(c.currentStartYear) },
    ...c.previousCompanies.map((p) => ({ title: p.title, company: p.company, years: t.yearRange(p.startYear, p.endYear) })),
  ];
  const qualifications = [...c.qualifications.map((q) => t.qualificationFull[q]), ...c.otherQualifications];

  return (
    <Modal
      labelledBy={titleId}
      onClose={onClose}
      initialFocus={closeRef}
      placement="right"
      className="max-w-[560px] rounded-l-xl border-y-0 border-r-0 px-5 py-6 sm:px-8 sm:py-7"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t.closeCv}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-line text-[20px] leading-none hover:border-ink/45"
      >
        <span aria-hidden>×</span>
      </button>
      <h2 id={titleId} className="pr-14 text-[24px] leading-tight font-bold tracking-[-0.01em]">
        <span className="sr-only">{t.cvDialog(t.displayName(c))}: </span>
        <span aria-hidden>{t.displayName(c)}</span>
      </h2>
      <p className="mt-1 text-[13px]">{t.titleAt(c)}</p>
      <div aria-hidden className="mt-5 h-[3px] w-10 rounded-full bg-accent" />
      {cv.error && (
        <p role="alert" className="mt-4 text-[13px] text-pick-ink">
          {t.loadError}
        </p>
      )}

      <CvSection title={t.cvProfile}>
        <p>{t.profileText(c)}</p>
      </CvSection>

      <CvSection title={t.cvExperience}>
        <ul className="flex flex-col gap-3">
          {jobs.map((j, i) => (
            <li key={i} className="flex items-start justify-between gap-4">
              <div>
                <div className="font-bold">{j.title}</div>
                <div className="text-muted">{j.company}</div>
              </div>
              <div className="flex-none text-right text-muted">{j.years}</div>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title={t.cvEducation}>
        {c.education.length === 0 ? (
          <p className="text-muted">{t.schoolNone}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {/* Highest degree first, like a CV. */}
            {c.education
              .map((e, i) => ({ e, i }))
              .reverse()
              .map(({ e, i }) => (
                <li key={i}>{t.educationLine(e)}</li>
              ))}
          </ul>
        )}
      </CvSection>

      <CvSection title={t.cvLanguages}>
        <p>{t.languagesText(c)}</p>
      </CvSection>

      {qualifications.length > 0 && (
        <CvSection title={t.cvQualifications}>
          <p>{qualifications.join(', ')}</p>
        </CvSection>
      )}
    </Modal>
  );
}
