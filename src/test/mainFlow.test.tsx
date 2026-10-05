// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { fmtNum } from '../i18n';
import { api } from '../lib/api';
import { emptyFilters } from '../lib/filters';
import { Root } from '../Root';
import type { Filters } from '../types';

/** The live count in the left column, e.g. "4,860". */
const shownCount = () => {
  const aside = screen.getByRole('complementary', { name: 'Search filters' });
  return within(aside).getByText('candidates match').textContent?.replace('candidates match', '').trim();
};
const expectCount = async (f: Partial<Filters>) => {
  const n = await api.countCandidates({ steps: [], filters: { ...emptyFilters(), ...f } });
  await waitFor(() => expect(shownCount()).toBe(fmtNum(n)));
  return n;
};
/** The segmented button group (not the row around it) with this name. */
const buttonGroup = (name: string) => screen.getAllByRole('group', { name }).at(-1) as HTMLElement;

beforeAll(async () => {
  await api.warmUp();
}, 60_000);

describe('main search flow', () => {
  it('filters, fills levels from TOEIC and JLPT, shows results and searches within them', async () => {
    const user = userEvent.setup();
    render(<Root />);
    await waitFor(() => expect(shownCount()).toBe('4,860'));

    // Degree + major: the major applies to that same degree; MBA has no major.
    await user.click(screen.getByRole('button', { name: "Master's" }));
    const masters = await expectCount({ degrees: ["Master's"] });
    await user.selectOptions(screen.getByLabelText("Major for Master's"), 'engineering');
    const engineers = await expectCount({ degrees: ["Master's"], majorFor: { "Master's": 'engineering' } });
    expect(engineers).toBeLessThan(masters);
    await user.click(screen.getByRole('button', { name: 'MBA' }));
    expect(screen.queryByLabelText('Major for MBA')).not.toBeInTheDocument();

    // TOEIC 820 picks Fluent; 1200 is refused with a reason; JLPT N2 picks Business.
    const toeic = screen.getByLabelText('TOEIC score');
    await user.type(toeic, '820');
    // Applied after a short typing pause.
    await waitFor(() =>
      expect(within(buttonGroup('English level')).getByRole('button', { name: 'Fluent' })).toHaveAttribute('aria-pressed', 'true'),
    );
    expect(screen.getByText('TOEIC 820 = Fluent')).toBeInTheDocument();
    await user.clear(toeic);
    await user.type(toeic, '1200');
    expect(toeic).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('TOEIC is 10 to 990')).toBeInTheDocument();
    // Typed quickly, 1200 never applies 120 (Basic) on the way: the level stays as it was.
    expect(within(buttonGroup('English level')).getByRole('button', { name: 'Fluent' })).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(screen.getByText('TOEIC 820 = Fluent')).toBeInTheDocument();
    await user.click(within(buttonGroup('JLPT')).getByRole('button', { name: 'N2' }));
    expect(within(buttonGroup('Japanese level')).getByRole('button', { name: 'Business' })).toHaveAttribute('aria-pressed', 'true');

    // Show the results, then search within them for A-rank people.
    await user.click(screen.getByRole('button', { name: 'Show candidates' }));
    expect((await screen.findAllByRole('listitem')).length).toBeGreaterThan(0);
    // (jsdom applies no CSS, so the name includes the short phone label too.)
    await user.click(screen.getByRole('button', { name: /Search within these results/ }));
    await user.click(screen.getByRole('tab', { name: /Gaishi fit/ }));
    await user.click(within(screen.getByRole('tabpanel')).getByRole('button', { name: 'A' }));
    const trail = screen.getByRole('navigation', { name: 'Search steps' });
    await waitFor(() => expect(within(trail).getByText('Search 2')).toBeInTheDocument());
    expect(within(trail).getByRole('button', { name: /Search 1/ })).toBeInTheDocument();

    // Switch to Japanese: the labels change, the search stays.
    await user.click(screen.getByRole('button', { name: '日本語' }));
    expect(await screen.findByRole('tab', { name: /外資適性/ })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: '検索の段階' })).getByText('検索 2')).toBeInTheDocument();
  }, 60_000);

  it('saves a search and loads it again after a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Root />);
    await waitFor(() => expect(shownCount()).toBe('4,860'));
    await user.click(screen.getByRole('checkbox', { name: 'Technology' }));
    await user.click(screen.getAllByRole('button', { name: 'Save search' })[0]);
    const name = screen.getByLabelText('Search name');
    await user.clear(name);
    await user.type(name, 'Tech people');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    unmount();

    // A refresh restores the search from the address; a fresh visit starts empty but keeps the saved search.
    render(<Root />);
    await expectCount({ industries: ['technology'] });
    cleanup();
    window.history.replaceState(null, '', '/');
    render(<Root />);
    await waitFor(() => expect(shownCount()).toBe('4,860'));
    await user.click(screen.getByRole('button', { name: /Tech people/ }));
    await expectCount({ industries: ['technology'] });
  }, 60_000);
});
