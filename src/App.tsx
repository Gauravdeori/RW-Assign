import { lazy, Suspense, useCallback } from 'react';
import { useConversions } from './features/dashboard/useConversions';
import { SearchPage } from './features/search/SearchPage';
import { useSavedSearches } from './features/search/state/SavedSearchesContext';
import { useSettings } from './features/settings/SettingsContext';
import { TopBar } from './features/shell/TopBar';
import { useHashRoute } from './hooks/useHashRoute';
import { useI18n } from './i18n';

// Loaded on demand, the first time each page is visited.
const UploadPage = lazy(() => import('./features/upload/UploadPage').then((m) => ({ default: m.UploadPage })));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('./features/admin/AdminPage').then((m) => ({ default: m.AdminPage })));
const AssignmentPage = lazy(() => import('./features/assignment/AssignmentPage').then((m) => ({ default: m.AssignmentPage })));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));

/**
 * Pages: Resume Finder (the candidate search, one screen), the Resume Studio pages Upload Resume, Dashboard and
 * Admin, and Assignment (with Analytics to come). State shared across pages lives in the providers set up in main.tsx.
 */
export default function App() {
  const { t } = useI18n();
  const [route, go] = useHashRoute();
  const conversions = useConversions();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { resetSaved } = useSavedSearches();
  const toSearch = useCallback(() => go('search'), [go]);

  if (route === 'search')
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-page text-ink">
        <TopBar route={route} onRunSaved={toSearch} />
        <SearchPage />
      </div>
    );

  if (route === 'assignment')
    return (
      <div className="flex min-h-dvh flex-col bg-page text-ink">
        <TopBar route={route} onRunSaved={toSearch} />
        <Suspense fallback={<div className="skeleton m-5 h-64" />}>
          <AssignmentPage />
        </Suspense>
      </div>
    );

  return (
    <div className="studio-bg flex min-h-screen flex-col text-ink">
      <TopBar route={route} onRunSaved={toSearch} />
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-4 pt-5 pb-12 sm:pt-8 md:px-8">
        <Suspense fallback={<div className="skeleton h-64" />}>
          {route === 'admin' ? (
            <AdminPage
              settings={settings}
              onSettings={updateSettings}
              conversionsCount={conversions.conversions.length}
              onResetOthers={() => {
                resetSaved();
                conversions.reset();
                resetSettings();
              }}
            />
          ) : route === 'analytics' ? (
            <AnalyticsPage />
          ) : route === 'upload' ? (
            <UploadPage onConverted={conversions.add} onOpenDashboard={() => go('dashboard')} />
          ) : (
            <DashboardPage
              list={conversions.conversions}
              onDelete={conversions.remove}
              onRestore={conversions.restore}
              onUpload={() => go('upload')}
            />
          )}
        </Suspense>
      </main>
      <footer className="mx-auto w-full max-w-[1300px] px-4 pt-2 pb-8 text-[12px] text-muted md:px-8">{t.footer}</footer>
    </div>
  );
}
