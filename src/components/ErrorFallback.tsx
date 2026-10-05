import { useI18n } from '../i18n';

/** Friendly page shown when something breaks: what happened, and a way out. */
export function ErrorFallback() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4 text-ink">
      <div role="alert" className="max-w-[440px] rounded-xl border border-line bg-card p-6 shadow-card">
        <h1 className="text-[20px] font-bold">{t.errorTitle}</h1>
        <div aria-hidden className="mt-2 h-[3px] w-7 rounded-full bg-accent" />
        <p className="mt-3 text-[14px] leading-relaxed">{t.errorBody}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 h-10 rounded-lg bg-ink px-5 text-[14px] font-bold text-page hover:bg-ink/90"
        >
          {t.errorReload}
        </button>
      </div>
    </main>
  );
}
