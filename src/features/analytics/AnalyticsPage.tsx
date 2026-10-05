import { useI18n } from '../../i18n';
import { hrefFor } from '../../lib/route';
import { PANEL, PRIMARY_BTN } from '../assignment/styles';

/** Analytics: a placeholder until the numbers are agreed with Robert Walters. */
export function AnalyticsPage() {
  const { t } = useI18n();
  return (
    <section className={`${PANEL} mx-auto max-w-[640px] px-8 py-10 text-center`}>
      <span className="inline-flex h-[26px] items-center rounded bg-pick px-2 text-[13px] font-bold text-pick-ink">
        {t.analytics.badge}
      </span>
      <h1 className="mt-4 text-[32px] leading-[1.1] font-extrabold tracking-[-0.4px]">{t.analytics.title}</h1>
      <div aria-hidden className="mx-auto mt-4 h-[3px] w-10 rounded-full bg-accent" />
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{t.analytics.body}</p>
      <a href={hrefFor('assignment')} className={`${PRIMARY_BTN} mt-6`}>
        {t.analytics.cta}
      </a>
    </section>
  );
}
