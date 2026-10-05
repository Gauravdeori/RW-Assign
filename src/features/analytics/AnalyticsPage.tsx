import { useId, useMemo, useState } from 'react';
import { fmtNum, useI18n } from '../../i18n';
import { analyze } from '../../lib/assignment';
import { ASSIGNMENT_NOW, RECRUITERS } from '../../lib/assignmentMock';
import { cx } from '../../lib/cx';
import { hrefFor } from '../../lib/route';
import { PROGRESS_STEPS, type ReassignReason, type TeamId } from '../../types';
import { Avatar } from '../assignment/Avatar';
import { CAPTION, PANEL, choice } from '../assignment/styles';
import { useAssignments } from '../assignment/useAssignments';

const SCOPES: ('all' | TeamId)[] = ['all', 'finance', 'technology'];
const REASONS: ReassignReason[] = ['busy', 'wrong', 'other'];
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);

/**
 * Analytics: follow-up numbers counted live from the Assignment data (the same store, so assigning, reassigning and
 * recording progress there changes these numbers). One team or all of Robert Walters.
 */
export function AnalyticsPage() {
  const { t } = useI18n();
  const an = t.analytics;
  const titleId = useId();
  const { rows } = useAssignments();
  const [scope, setScope] = useState<'all' | TeamId>('all');
  const data = useMemo(() => analyze(rows, RECRUITERS, scope === 'all' ? null : scope, ASSIGNMENT_NOW), [rows, scope]);
  const base = data.funnel[0];
  const funnel = [an.assigned, ...PROGRESS_STEPS.map((s) => t.assign.steps[s])].map((label, i) => ({ label, n: data.funnel[i] }));
  const stats = [
    { label: an.stat.total, value: data.total },
    { label: an.stat.pool, value: data.pool },
    { label: an.stat.notActed, value: data.notActed, dot: 'bg-accent' },
    { label: an.stat.interviews, value: data.interviews },
    { label: an.stat.hired, value: data.hired, dot: 'bg-go' },
  ];
  const reasonTotal = REASONS.reduce((n, r) => n + data.reasons[r], 0);
  const c = an.col;

  return (
    <section aria-labelledby={titleId}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 id={titleId} className="text-[32px] leading-[1.1] font-extrabold tracking-[-0.4px]">
            {an.title}
          </h1>
          <p className="mt-1 text-[15px] text-muted">{an.sub}</p>
        </div>
        <div role="group" aria-label={an.scopeLabel} className="flex flex-wrap gap-1.5">
          {SCOPES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={scope === s}
              onClick={() => setScope(s)}
              className={cx(choice(scope === s), 'h-[38px] justify-center px-3 text-[15px]')}
            >
              {an.scope[s]}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className={`${PANEL} p-[18px]`}>
            <dt className="flex items-center gap-2 text-[13px] text-muted">
              {s.dot && <span aria-hidden className={`h-2 w-2 flex-none rounded-full ${s.dot}`} />}
              {s.label}
            </dt>
            <dd className="mt-1.5 text-[32px] leading-none font-bold tracking-[-0.02em]">{fmtNum(s.value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby={`${titleId}-funnel`} className={`${PANEL} p-[18px]`}>
          <h2 id={`${titleId}-funnel`} className="text-[18px] font-bold">
            {an.funnelTitle}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">{an.funnelSub}</p>
          <ol className="mt-4 flex flex-col gap-2">
            {funnel.map(({ label, n }, i) => (
              <li key={label} className="group relative grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3">
                <span className="truncate text-[13px] text-muted">{label}</span>
                {/* Bars grow from one baseline; the longest leaves room for its value at the tip. */}
                <span className="flex h-[30px] min-w-0 items-center gap-2 border-l border-line">
                  <span
                    aria-hidden
                    className={cx('h-5 flex-none rounded-r-[4px] group-hover:brightness-110', i === 0 ? 'bg-muted/40' : 'bg-go')}
                    style={{ width: `${base ? (n / base) * 82 : 0}%` }}
                  />
                  <span className="tabular text-[13px] font-semibold whitespace-nowrap">{an.funnelValue(n, pct(n, base))}</span>
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none invisible absolute bottom-full left-[124px] z-10 mb-1 rounded-md bg-ink px-2 py-1 text-[13px] whitespace-nowrap text-page shadow-hover group-hover:visible"
                >
                  {an.funnelTip(n, pct(n, base))}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`${titleId}-reasons`} className={`${PANEL} p-[18px]`}>
          <h2 id={`${titleId}-reasons`} className="text-[18px] font-bold">
            {an.reasonsTitle}
          </h2>
          {reasonTotal === 0 ? (
            <p className="mt-3 text-[13px] text-muted">{an.reasonsEmpty}</p>
          ) : (
            <dl className="mt-3">
              {REASONS.map((r) => (
                <div key={r} className="flex min-h-[38px] items-center gap-2.5 border-b border-panel-line text-[15px] last:border-b-0">
                  <span aria-hidden className="h-2 w-2 flex-none rounded-full bg-amber" />
                  <dt className="min-w-0 flex-1">{t.assign.reasons[r]}</dt>
                  <dd className="tabular font-bold">{fmtNum(data.reasons[r])}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      <section aria-labelledby={`${titleId}-rec`} className={`${PANEL} mt-3`}>
        <div className="px-[18px] pt-[18px]">
          <h2 id={`${titleId}-rec`} className="text-[18px] font-bold">
            {an.recruitersTitle}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">{an.recruitersSub}</p>
        </div>
        <div className="relative mt-2 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-[15px]">
            <thead>
              <tr className={cx('h-10', CAPTION)}>
                <th scope="col" className="pr-2 pl-[18px]">
                  {c.recruiter}
                </th>
                <th scope="col" className="px-2">
                  {c.team}
                </th>
                {[c.open, c.notActed, c.handedOn, c.reachedOut, c.interviews, c.hired].map((h, i) => (
                  <th key={h} scope="col" className={cx('px-2 text-right', i === 5 && 'pr-[18px]')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recruiters.map((s) => (
                <tr key={s.recruiter.id} className="h-[52px] border-t border-panel-line">
                  <th scope="row" className="pr-2 pl-[18px] font-semibold">
                    <span className="flex items-center gap-2">
                      <Avatar recruiter={s.recruiter} />
                      {t.assign.name(s.recruiter.firstName, s.recruiter.lastName)}
                    </span>
                  </th>
                  <td className="px-2 text-muted">{t.assign.team[s.recruiter.team]}</td>
                  <td className="tabular px-2 text-right">{fmtNum(s.open)}</td>
                  <td className="px-2 text-right">
                    {s.notActed > 0 ? (
                      <span className="tabular inline-flex h-[26px] items-center rounded bg-pick px-2 text-[13px] font-bold text-pick-ink">
                        {fmtNum(s.notActed)}
                      </span>
                    ) : (
                      <span className="tabular">{fmtNum(0)}</span>
                    )}
                  </td>
                  <td className="tabular px-2 text-right">{fmtNum(s.handedOn)}</td>
                  <td className="tabular px-2 text-right whitespace-nowrap">{an.ofAssigned(s.reachedOut, s.assigned)}</td>
                  <td className="tabular px-2 text-right">{fmtNum(s.interviews)}</td>
                  <td className="tabular px-2 pr-[18px] text-right">{fmtNum(s.hired)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
        <span>{an.note}</span>
        <a href={hrefFor('assignment')} className="font-semibold text-pick-ink underline underline-offset-2">
          {an.cta}
        </a>
      </p>
    </section>
  );
}
