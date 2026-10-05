import { useMemo } from 'react';
import type { Menu } from '../../components/MenuBar';
import type { Dict } from '../../i18n';
import type { Theme } from '../../lib/theme';
import type { ViewPrefs } from '../../types';
import type { HelpTopic } from './dialogs/HelpDialog';
import type { SearchActions } from './state/SearchContext';

interface MenuHandlers {
  t: Dict;
  actions: SearchActions;
  canUndo: boolean;
  openSaved: () => void;
  save: () => void;
  saveAs: () => void;
  exportResults: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  view: ViewPrefs;
  setView: (v: ViewPrefs) => void;
  showHelp: (topic: HelpTopic) => void;
}

/** The menu bar under the top bar: File, Edit, View, Help. */
export function useSearchMenus(h: MenuHandlers): Menu[] {
  const { t, actions, canUndo, openSaved, save, saveAs, exportResults, theme, setTheme, view, setView, showHelp } = h;
  return useMemo(
    () => [
      {
        label: t.menu.file,
        items: [
          { kind: 'action', label: t.menu.newSearch, onSelect: actions.newSearch },
          { kind: 'action', label: t.menu.openSaved, onSelect: openSaved },
          { kind: 'separator' },
          { kind: 'action', label: t.menu.save, shortcut: 'Ctrl+S', onSelect: save },
          { kind: 'action', label: t.menu.saveAs, onSelect: saveAs },
          { kind: 'separator' },
          { kind: 'action', label: t.menu.exportCsv, onSelect: exportResults },
        ],
      },
      {
        label: t.menu.edit,
        items: [
          { kind: 'action', label: t.menu.clearAll, onSelect: actions.clear },
          { kind: 'action', label: t.menu.undo, shortcut: 'Ctrl+Z', disabled: !canUndo, onSelect: actions.undo },
        ],
      },
      {
        label: t.menu.view,
        items: [
          { kind: 'radio', label: t.menu.light, checked: theme === 'light', onSelect: () => setTheme('light') },
          { kind: 'radio', label: t.menu.dark, checked: theme === 'dark', onSelect: () => setTheme('dark') },
          { kind: 'separator' },
          {
            kind: 'radio',
            label: t.menu.compact,
            checked: view.density === 'compact',
            onSelect: () => setView({ ...view, density: 'compact' }),
          },
          {
            kind: 'radio',
            label: t.menu.comfortable,
            checked: view.density === 'comfortable',
            onSelect: () => setView({ ...view, density: 'comfortable' }),
          },
          { kind: 'separator' },
          { kind: 'radio', label: t.menu.oneCol, checked: view.results === 'list', onSelect: () => setView({ ...view, results: 'list' }) },
          {
            kind: 'radio',
            label: t.menu.threeCol,
            checked: view.results === 'grid',
            onSelect: () => setView({ ...view, results: 'grid' }),
          },
        ],
      },
      {
        label: t.menu.help,
        items: [
          { kind: 'action', label: t.menu.howTo, onSelect: () => showHelp('howTo') },
          { kind: 'action', label: t.menu.shortcuts, onSelect: () => showHelp('shortcuts') },
          { kind: 'separator' },
          { kind: 'action', label: t.menu.about, onSelect: () => showHelp('about') },
        ],
      },
    ],
    [t, actions, canUndo, openSaved, save, saveAs, exportResults, theme, setTheme, view, setView, showHelp],
  );
}
