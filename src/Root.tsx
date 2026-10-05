import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { SavedSearchesProvider } from './features/search/state/SavedSearchesProvider';
import { SearchProvider } from './features/search/state/SearchProvider';
import { SettingsProvider } from './features/settings/SettingsProvider';
import { I18nProvider } from './i18n';

/** The app with everything it needs around it: labels, a crash fallback, and the shared state. */
export function Root() {
  return (
    <I18nProvider>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <SettingsProvider>
          <SavedSearchesProvider>
            <SearchProvider>
              <App />
            </SearchProvider>
          </SavedSearchesProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
}
