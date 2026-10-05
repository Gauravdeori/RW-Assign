import { useId } from 'react';

export interface SearchListItem {
  id: string;
  name: string;
  summary: string;
  onPick: () => void;
}

/** Saved or recent searches in the left column: name and a one-line summary; picking one loads it. */
export function SearchList({
  title,
  items,
  empty,
  more,
}: {
  title: string;
  items: SearchListItem[];
  empty: string;
  more?: { label: string; onClick: () => void };
}) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="px-1 text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-1.5 px-1 text-[12px] text-muted">{empty}</p>
      ) : (
        <ul className="mt-1 flex flex-col">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={it.onPick}
                className="block w-full rounded-lg border border-transparent px-2 py-1.5 text-left hover:border-accent/50 hover:bg-pick/50"
              >
                <span className="block truncate text-[13px] leading-[17px] font-semibold">{it.name}</span>
                <span className="block truncate text-[11.5px] leading-[15px] text-muted">{it.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {more && (
        <button
          type="button"
          onClick={more.onClick}
          className="mt-0.5 px-1 text-[12px] text-muted underline underline-offset-2 hover:text-accent"
        >
          {more.label}
        </button>
      )}
    </section>
  );
}
