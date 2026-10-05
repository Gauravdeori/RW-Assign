import { StrictMode, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { loadJa, storedLang } from './i18n';
import { api } from './lib/api';
import { Root } from './Root';
import './styles/index.css';

const container = document.getElementById('root');

// A transition lets React split the first render into short slices instead of one long task.
const render = () => {
  if (!container) return;
  startTransition(() =>
    createRoot(container).render(
      <StrictMode>
        <Root />
      </StrictMode>,
    ),
  );
};

// Before the first render: get the API ready (mock: build the sample data in slices, so no long task) and, only
// for people who chose Japanese, fetch its separate chunk so there is no English flash. index.html shows the top
// bar meanwhile. If either fails, render anyway: the page shows its own error and retry.
void Promise.allSettled([api.warmUp(), storedLang() === 'ja' ? loadJa() : null]).then(render);
