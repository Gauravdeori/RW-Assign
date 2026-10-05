import { lazy, Suspense, useCallback, useId, useMemo, useState } from 'react';
import { Toast } from '../../components/Toast';
import { CONFIG } from '../../config';
import { useToast } from '../../hooks/useToast';
import { useI18n } from '../../i18n';
import { inView, matchesFilter, matchesQuery, newestFirst, statusOf, summarize } from '../../lib/assignment';
import { ASSIGNMENT_NOW, ME, MY_TEAM, RECRUITERS } from '../../lib/assignmentMock';
import { cx } from '../../lib/cx';
import type { AssignmentFilter, AssignmentView, Recruiter } from '../../types';
import { AssignmentSidebar } from './AssignmentSidebar';
import { AssignmentTable } from './AssignmentTable';
import type { RowHandlers } from './AssignmentRow';
import { AssignPopover } from './AssignPopover';
import { ProgressPopover } from './ProgressPopover';
import { ReassignDialog } from './ReassignDialog';
import { ScheduleDialog } from './ScheduleDialog';
import { FIELD, ROW_BTN, choice } from './styles';
import { useAssignments } from './useAssignments';

// The same CV preview as the search page, loaded the first time a CV is opened.
const CvDrawer = lazy(() => import('../search/cv/CvDrawer'));

const FILTERS: AssignmentFilter[] = ['all', 'notActed', 'reassigned', 'unassigned'];
const TEAM_SIZE = RECRUITERS.filter((r) => r.team === MY_TEAM).length;

type Open = { kind: 'cv' | 'reassign' | 'schedule'; id: string } | null;

/**
 * Assignment page (proof of concept, sample data): hand each new resume to a recruiter in one step, then track
 * whether they follow up. Three dashboards share one table: Individual (mine), Team and Global. Candidates nobody
 * acts on turn red; reassigned ones turn orange.
 */
export function AssignmentPage() {
  const { t } = useI18n();
  const titleId = useId();
  const { rows, recruiters, actions } = useAssignments();
  const [view, setView] = useState<AssignmentView>('individual');
  const [filter, setFilter] = useState<AssignmentFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [assigning, setAssigning] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [editing, setEditing] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [open, setOpen] = useState<Open>(null);
  const [toast, notify] = useToast();

  const statuses = useMemo(() => new Map(rows.map((a) => [a.id, statusOf(a, ASSIGNMENT_NOW)])), [rows]);
  const summary = useMemo(() => summarize(rows, view, ME, MY_TEAM, ASSIGNMENT_NOW), [rows, view]);
  const shown = useMemo(
    () =>
      rows
        .filter((a) => inView(a, view, ME, MY_TEAM) && matchesFilter(a, filter, ASSIGNMENT_NOW) && matchesQuery(a, query, recruiters))
        .sort(newestFirst),
    [rows, view, filter, query, recruiters],
  );

  const size = CONFIG.assignmentPageSize;
  const pages = Math.max(1, Math.ceil(shown.length / size));
  const p = Math.min(page, pages - 1);
  const pageRows = shown.slice(p * size, (p + 1) * size);

  const byId = (id: string) => rows.find((a) => a.id === id);
  const assigningRow = assigning ? byId(assigning.id) : undefined;
  const editingRow = editing ? byId(editing.id) : undefined;
  const openRow = open ? byId(open.id) : undefined;
  const openRecruiter = openRow?.recruiterId ? recruiters.get(openRow.recruiterId) : undefined;

  const pickView = useCallback((v: AssignmentView) => {
    setView(v);
    setPage(0);
    setAssigning(null);
    setEditing(null);
  }, []);

  const handlers = useMemo<RowHandlers>(
    () => ({
      onCv: (id) => setOpen({ kind: 'cv', id }),
      onAssign: (id, anchor) => setAssigning((cur) => (cur?.id === id ? null : { id, anchor })),
      onReassign: (id) => setOpen({ kind: 'reassign', id }),
      onSchedule: (id) => setOpen({ kind: 'schedule', id }),
      onProgress: (id, anchor) => setEditing((cur) => (cur?.id === id ? null : { id, anchor })),
    }),
    [],
  );

  const assign = (r: Recruiter) => {
    if (!assigningRow) return;
    actions.assign(assigningRow.id, r);
    notify(t.assign.assigned(t.assign.name(assigningRow.firstName, assigningRow.lastName), t.assign.name(r.firstName, r.lastName)));
    setAssigning(null);
    // The Assign button is gone: carry on from the same row.
    const id = assigningRow.id;
    requestAnimationFrame(() => document.getElementById(`reassign-${id}`)?.focus());
  };

  const showing = shown.length === 0 ? t.assign.showing(0, 0, 0) : t.assign.showing(p * size + 1, p * size + pageRows.length, shown.length);

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-5 pb-4">
        <div className="grid gap-4 desk:grid-cols-[250px_minmax(0,1fr)]">
          <AssignmentSidebar view={view} onView={pickView} summary={summary} teamSize={TEAM_SIZE} />

          <section aria-labelledby={titleId} className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div className="min-w-0 flex-[1_1_320px]">
                <h1 id={titleId} className="text-[32px] leading-[1.1] font-extrabold tracking-[-0.4px]">
                  {t.assign.viewTitle[view]}
                </h1>
                <p className="mt-1 text-[15px] leading-snug text-muted">{t.assign.viewSub(view, CONFIG.assignmentReturnHours)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  aria-label={t.assign.searchLabel}
                  placeholder={t.assign.searchLabel}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  className={cx(FIELD, 'w-full sm:w-[236px]')}
                />
                <div role="group" aria-label={t.assign.filterLabel} className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={filter === f}
                      onClick={() => {
                        setFilter(f);
                        setPage(0);
                      }}
                      className={cx(choice(filter === f), 'h-[38px] justify-center px-3 text-[15px]')}
                    >
                      {t.assign.filter[f]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <AssignmentTable
                rows={pageRows}
                statuses={statuses}
                recruiters={recruiters}
                you={view === 'individual' ? ME : null}
                assigningId={assigning?.id ?? null}
                progressId={editing?.id ?? null}
                handlers={handlers}
                onShowAll={() => {
                  setFilter('all');
                  setQuery('');
                  setPage(0);
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[13px] text-muted">
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                <li className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
                  {t.assign.legend.red}
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-amber" />
                  {t.assign.legend.orange}
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-go" />
                  {t.assign.legend.green}
                </li>
              </ul>
              <div className="flex items-center gap-2">
                <span aria-live="polite" className="tabular">
                  {showing}
                </span>
                {pages > 1 && (
                  <nav aria-label={t.assign.pagesLabel} className="flex gap-1">
                    <button
                      type="button"
                      aria-label={t.prevPage}
                      disabled={p === 0}
                      onClick={() => setPage(p - 1)}
                      className={cx(ROW_BTN, 'h-[30px] w-[30px] px-0')}
                    >
                      <span aria-hidden>‹</span>
                    </button>
                    <button
                      type="button"
                      aria-label={t.nextPage}
                      disabled={p >= pages - 1}
                      onClick={() => setPage(p + 1)}
                      className={cx(ROW_BTN, 'h-[30px] w-[30px] px-0')}
                    >
                      <span aria-hidden>›</span>
                    </button>
                  </nav>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="mx-auto w-full max-w-[1440px] px-4 pb-6 text-[13px] text-muted">{t.assign.footer}</footer>

      {assigning && assigningRow && (
        <AssignPopover
          anchor={assigning.anchor}
          candidate={t.assign.name(assigningRow.firstName, assigningRow.lastName)}
          recruiters={RECRUITERS}
          rows={rows}
          onAssign={assign}
          onClose={(refocus) => {
            setAssigning(null);
            if (refocus) assigning.anchor.focus();
          }}
        />
      )}

      {editing && editingRow?.recruiterId && (
        <ProgressPopover
          anchor={editing.anchor}
          a={editingRow}
          onSteps={(n) => actions.setSteps(editingRow.id, n)}
          onCount={(key, n) => actions.setCount(editingRow.id, key, n)}
          onClose={(refocus) => {
            setEditing(null);
            if (refocus) editing.anchor.focus();
          }}
        />
      )}

      {open?.kind === 'cv' && openRow && (
        <Suspense fallback={null}>
          <CvDrawer summary={openRow.cv} complete onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open?.kind === 'reassign' && openRow && (
        <ReassignDialog
          candidate={openRow}
          recruiters={RECRUITERS}
          onClose={() => setOpen(null)}
          onReassign={(reason, to) => {
            actions.reassign(openRow.id, to, reason);
            const name = t.assign.name(openRow.firstName, openRow.lastName);
            notify(to ? t.assign.reassignedTo(name, t.assign.name(to.firstName, to.lastName)) : t.assign.reassignedPool(name));
            setOpen(null);
          }}
        />
      )}
      {open?.kind === 'schedule' && openRow && openRecruiter && (
        <ScheduleDialog
          candidate={openRow}
          recruiter={openRecruiter}
          onClose={() => setOpen(null)}
          onSend={(meeting, times) => {
            actions.timesSent(openRow.id, meeting, times);
            notify(t.assign.timesSent(openRow.firstName));
            setOpen(null);
          }}
          onPick={(slot) => {
            actions.pickTime(openRow.id, slot);
            notify(t.assign.booked(openRow.firstName, t.assign.slot(slot)));
            setOpen(null);
          }}
        />
      )}
      <Toast message={toast} />
    </>
  );
}
