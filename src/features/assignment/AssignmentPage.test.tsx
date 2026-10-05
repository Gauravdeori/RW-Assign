// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { loadActivity } from '../../lib/admin';
import { resetAssignments } from '../../lib/assignmentStore';
import { AnalyticsPage } from '../analytics/AnalyticsPage';
import { AssignmentPage } from './AssignmentPage';

const renderPage = () =>
  render(
    <I18nProvider>
      <AssignmentPage />
    </I18nProvider>,
  );

const row = (name: string) => screen.getByRole('row', { name: new RegExp(name) });
const countCard = () =>
  within(screen.getByRole('complementary', { name: 'Assignment' })).getByText(/need action|not acted on|unassigned/, {
    selector: 'p',
  });

// Each test starts from the sample data (the store is shared and kept in the browser).
beforeEach(() => resetAssignments());

/** The check list from the build spec: assign, reassign, schedule, switch views, filter. */
describe('Assignment page', () => {
  it('runs the spec test: assign, reassign, schedule, switch views and filter', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <AssignmentPage />
      </I18nProvider>,
    );

    // Individual view by default: only Takeshi Kondo's candidates.
    expect(screen.getByRole('heading', { level: 1, name: 'My assignments' })).toBeInTheDocument();
    expect(countCard()).toHaveTextContent('3 need action');
    expect(screen.queryByRole('row', { name: /Tomoko Tanaka/ })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 6 of 6')).toBeInTheDocument();

    // Assign Tomoko Tanaka to Mai Suzuki, inline, from the Global view.
    await user.click(screen.getByRole('button', { name: /All Robert Walters/ }));
    expect(countCard()).toHaveTextContent('3 unassigned');
    await user.type(screen.getByRole('searchbox', { name: 'Search candidate or recruiter' }), 'Tomoko');
    await user.click(within(row('Tomoko Tanaka')).getByRole('button', { name: 'Assign Tomoko Tanaka' }));
    const box = screen.getByRole('combobox');
    expect(box).toHaveFocus();
    await user.type(box, 'mai.su');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(row('Tomoko Tanaka')).getByText('Mai Suzuki')).toBeInTheDocument();
    expect(within(row('Tomoko Tanaka')).getByText('In progress')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Tomoko Tanaka assigned to Mai Suzuki');
    expect(countCard()).toHaveTextContent('2 unassigned');
    await user.clear(screen.getByRole('searchbox'));

    // Reassign Haruka Yamamoto as "Too busy": dialog, reason, the row turns orange.
    await user.click(screen.getByRole('button', { name: /My assignments/ }));
    await user.click(screen.getByRole('button', { name: 'Reassign Haruka Yamamoto' }));
    let dialog = screen.getByRole('dialog', { name: 'Reassign Haruka Yamamoto' });
    expect(within(dialog).getByText('Haruka goes back to the pool and the team lead is notified.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: 'Wrong assignment (not my area)' }));
    await user.click(within(dialog).getByRole('radio', { name: 'Too busy right now' }));
    expect(within(dialog).getByRole('radio', { name: 'Too busy right now' })).toHaveAttribute('aria-checked', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Reassign' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(row('Haruka Yamamoto')).getByText('Reassigned')).toBeInTheDocument();
    expect(within(row('Haruka Yamamoto')).getByText('Too busy')).toBeInTheDocument();
    expect(within(row('Haruka Yamamoto')).getByRole('button', { name: 'Schedule a meeting with Haruka Yamamoto' })).toBeDisabled();

    // Esc closes a dialog without changes.
    await user.click(screen.getByRole('button', { name: 'Reassign Yuki Kobayashi' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(row('Yuki Kobayashi')).getByText('Not acted on · 3d')).toBeInTheDocument();

    // Schedule Kenta Endo with three times: Reached out turns green.
    expect(within(row('Kenta Endo')).getByRole('button', { name: 'Progress for Kenta Endo: not started' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Schedule a meeting with Kenta Endo' }));
    dialog = screen.getByRole('dialog', { name: 'Schedule a meeting with Kenta Endo' });
    expect(within(dialog).getByText(/Kenta gets an email with Takeshi Kondo's open times/)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Send times to Kenta' })).toBeDisabled();
    for (const time of ['10:00', '13:30', '11:00']) await user.click(within(dialog).getAllByRole('button', { name: time })[0]);
    expect(within(dialog).getByText('3 times selected. Times shown in JST.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Send 3 times to Kenta' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Times sent to Kenta');
    expect(within(row('Kenta Endo')).getByRole('button', { name: 'Progress for Kenta Endo: Reached out done' })).toBeInTheDocument();
    expect(within(row('Kenta Endo')).getByText('3 times sent')).toBeInTheDocument();

    // Individual -> Team -> Global: title, count card and status numbers follow.
    await user.click(screen.getByRole('button', { name: /Finance hiring team/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Finance hiring team' })).toBeInTheDocument();
    expect(countCard()).toHaveTextContent('not acted on');
    expect(screen.getByText('across 6 recruiters in your team')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /All Robert Walters/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'All Robert Walters' })).toBeInTheDocument();
    expect(screen.getByText('Showing 8 of 30')).toBeInTheDocument();

    // Filter "Not acted on": only red rows.
    await user.click(screen.getByRole('button', { name: 'Not acted on' }));
    const body = screen.getAllByRole('rowgroup')[1];
    const shown = within(body).getAllByRole('row');
    expect(shown.length).toBeGreaterThan(0);
    for (const r of shown) expect(within(r).getByText(/^Not acted on · \dd$/)).toBeInTheDocument();
  }, 20_000);

  it('opens the CV in the same preview as the search page', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <AssignmentPage />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Open CV for Aiko Ito' }));
    const cv = await screen.findByRole('dialog', { name: /CV of Aiko Ito/ });
    expect(within(cv).getByText('Managing Director, J.P. Morgan')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('records progress: steps in order, job and interview counts, and the row follows', async () => {
    const user = userEvent.setup();
    renderPage();
    // Haruka is red: nothing done for two days.
    expect(within(row('Haruka Yamamoto')).getByText('Not acted on · 2d')).toBeInTheDocument();
    await user.click(within(row('Haruka Yamamoto')).getByRole('button', { name: /^Progress for Haruka Yamamoto/ }));
    const editor = screen.getByRole('dialog', { name: 'Progress for Haruka Yamamoto' });
    const step = (name: string) => within(editor).getByRole('button', { name });

    // Ticking Met ticks Reached out too.
    await user.click(step('Met'));
    expect(step('Reached out')).toHaveAttribute('aria-pressed', 'true');
    expect(step('Met')).toHaveAttribute('aria-pressed', 'true');
    expect(within(row('Haruka Yamamoto')).getByText('In progress')).toBeInTheDocument();

    // Job sent, then three jobs.
    await user.click(step('Job sent'));
    expect(within(editor).getByRole('group', { name: 'Jobs sent: 1' })).toBeInTheDocument();
    await user.click(within(editor).getByRole('button', { name: 'One more: Jobs sent' }));
    await user.click(within(editor).getByRole('button', { name: 'One more: Jobs sent' }));
    expect(within(editor).getByRole('group', { name: 'Jobs sent: 3' })).toBeInTheDocument();
    expect(within(editor).getByRole('button', { name: 'One more: Interviews' })).toBeDisabled();
    expect(within(row('Haruka Yamamoto')).getByRole('button', { name: /Reached out, Met, Job sent done/ })).toHaveTextContent('3');

    // Unticking Met unticks everything after it.
    await user.click(step('Met'));
    expect(step('Job sent')).toHaveAttribute('aria-pressed', 'false');
    expect(
      within(row('Haruka Yamamoto')).getByRole('button', { name: 'Progress for Haruka Yamamoto: Reached out done' }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(loadActivity()[0]).toMatchObject({ kind: 'progress', a: 'Haruka Yamamoto' });

    // Candidates in the pool have no recruiter yet, so their progress cannot change.
    await user.click(screen.getByRole('button', { name: /All Robert Walters/ }));
    expect(within(row('Emma Schmidt')).queryByRole('button', { name: /^Progress for/ })).not.toBeInTheDocument();
  });

  it('records the time the candidate picked from the times sent', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(within(row('Sota Nakamura')).getByText('3 times sent')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Schedule a meeting with Sota Nakamura' }));
    const dialog = screen.getByRole('dialog', { name: 'Schedule a meeting with Sota Nakamura' });
    expect(within(dialog).getByText('When Sota replies, record the time they picked:')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Tue 6 Oct, 13:30: Sota picked this' }));
    expect(screen.getByRole('status')).toHaveTextContent('Meeting with Sota booked: Tue 6 Oct, 13:30');
    expect(within(row('Sota Nakamura')).getByText('Tue 6 Oct, 13:30')).toBeInTheDocument();

    // Opening Schedule again shows the booked meeting.
    await user.click(screen.getByRole('button', { name: 'Schedule a meeting with Sota Nakamura' }));
    expect(within(screen.getByRole('dialog')).getByText('Tue 6 Oct, 13:30 · Video call · 30 min')).toBeInTheDocument();
  });

  it('keeps changes after leaving the page and writes them to the activity log', async () => {
    const user = userEvent.setup();
    const first = renderPage();
    await user.click(screen.getByRole('button', { name: /All Robert Walters/ }));
    await user.click(within(row('Emma Schmidt')).getByRole('button', { name: 'Assign Emma Schmidt' }));
    await user.type(screen.getByRole('combobox'), 'daniel{Enter}');
    expect(loadActivity()[0]).toMatchObject({ kind: 'assign', a: 'Emma Schmidt', b: 'Daniel Lee' });
    first.unmount();

    renderPage();
    await user.click(screen.getByRole('button', { name: /All Robert Walters/ }));
    expect(within(row('Emma Schmidt')).getByText('Daniel Lee')).toBeInTheDocument();
  });
});

describe('Analytics page', () => {
  it('counts from the assignment data and narrows to a team', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <AnalyticsPage />
      </I18nProvider>,
    );
    const stat = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling;
    expect(stat('New resumes')).toHaveTextContent('30');
    expect(stat('Waiting in the pool')).toHaveTextContent('3');
    expect(stat('Not acted on')).toHaveTextContent('6');
    expect(screen.getByText('27 · 100%')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Masato Shimizu/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Finance hiring' }));
    expect(stat('New resumes')).toHaveTextContent('21');
    expect(screen.queryByRole('rowheader', { name: /Masato Shimizu/ })).not.toBeInTheDocument();
    const kondo = screen.getByRole('row', { name: /Takeshi Kondo/ });
    expect(within(kondo).getByText('3 of 6')).toBeInTheDocument();
  });
});
