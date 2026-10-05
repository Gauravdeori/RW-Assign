import { memo } from 'react';
import { SteadyText } from '../../components/SteadyText';
import { ThemeSwitch } from '../../components/ThemeSwitch';
import { useI18n } from '../../i18n';
import { cx } from '../../lib/cx';
import { hrefFor, type Route } from '../../lib/route';
import type { Lang } from '../../types';
import { SavedSearchesMenu } from '../search/side/SavedSearchesMenu';

const LANGS: Lang[] = ['en', 'ja'];
/** Main pages on the left; Assignment, Analytics and Admin on the right, Admin always last. */
const LEFT: Route[] = ['search', 'upload', 'dashboard'];
const RIGHT: Route[] = ['assignment', 'analytics', 'admin'];

/** Sticky top bar. Memoised: results changing does not re-render it. */
export const TopBar = memo(function TopBar({ route, onRunSaved }: { route: Route; onRunSaved: () => void }) {
  const { t, lang, setLang } = useI18n();
  const link = (key: Route, label: string, className: (active: boolean) => string) => {
    const active = key === route;
    return (
      <a href={hrefFor(key)} aria-current={active ? 'page' : undefined} className={className(active)}>
        {/* Keeps the semibold width, so the menu does not shift when the page changes. */}
        <SteadyText>{label}</SteadyText>
      </a>
    );
  };
  const desktopLinks = (keys: Route[]) => (
    <ul className="flex items-center gap-6 text-[13px]">
      {keys.map((key) => (
        <li key={key}>
          {link(key, t.nav[key], (active) =>
            cx(
              'relative inline-block py-1 whitespace-nowrap',
              active
                ? 'font-semibold text-white after:absolute after:inset-x-0 after:-bottom-1 after:h-[3px] after:bg-accent'
                : 'text-white/75 hover:text-white',
            ),
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <header className="sticky top-0 z-30 flex-none border-b border-topbar-border bg-topbar text-white">
      <div className="flex h-12 items-center gap-4 px-4 lg:gap-7 lg:px-6">
        <a
          href={hrefFor('search')}
          aria-label={t.homeLabel}
          onClick={() => {
            // Already on Resume Finder: take the recruiter back to the top of the page.
            if (route === 'search') window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-none items-center"
        >
          <span aria-hidden className="text-[12px] leading-[1.05] font-extrabold tracking-tight">
            <span className="block">{t.brandTop}</span> <span className="block">{t.brandBottom}</span>
          </span>
        </a>
        <span aria-hidden className="-mx-2 hidden h-5 w-px bg-white/35 lg:block" />

        <nav
          aria-label={t.mainNav}
          className="hidden min-w-0 flex-1 items-center justify-between gap-6 self-stretch overflow-hidden lg:flex"
        >
          {desktopLinks(LEFT)}
          {desktopLinks(RIGHT)}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3 lg:ml-0">
          <ThemeSwitch />
          <div role="group" aria-label={t.language} className="flex border border-white/60">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cx(
                  'h-[30px] px-2 text-[12px] lg:text-[13px]',
                  lang === l
                    ? 'bg-[#3a1a1f] font-semibold text-accent shadow-[inset_0_0_0_1px_var(--accent)]'
                    : 'text-white hover:bg-white/10',
                )}
              >
                {t.langNames[l]}
              </button>
            ))}
          </div>
          <SavedSearchesMenu onRun={onRunSaved} />
        </div>
      </div>
      <nav aria-label={t.mainNav} className="border-t border-white/10 lg:hidden">
        {/* Six pages: equal tabs when they fit, sideways scrolling when they do not. */}
        <ul className="flex overflow-x-auto px-1 text-[12.5px] [scrollbar-width:none]">
          {[...LEFT, ...RIGHT].map((key) => (
            <li key={key} className="min-w-fit flex-1">
              {link(key, t.navShort[key], (active) =>
                cx(
                  'relative flex h-11 items-center justify-center px-2.5 whitespace-nowrap',
                  active
                    ? 'font-semibold text-white after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:bg-accent'
                    : 'text-white/70',
                ),
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
});
