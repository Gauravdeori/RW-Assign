import { DialogFrame } from '../../../components/DialogFrame';
import { useI18n } from '../../../i18n';

export type HelpTopic = 'howTo' | 'shortcuts' | 'about';

/** Help menu: how to search, keyboard shortcuts, about this prototype. */
export function HelpDialog({ topic, onClose }: { topic: HelpTopic; onClose: () => void }) {
  const { t } = useI18n();
  const title = topic === 'howTo' ? t.menu.howTo : topic === 'shortcuts' ? t.menu.shortcuts : t.menu.about;
  return (
    <DialogFrame title={title} onClose={onClose}>
      {topic === 'howTo' && (
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed">
          {t.help.howTo.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      )}
      {topic === 'shortcuts' && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
          {t.help.shortcuts.map(([keys, what]) => (
            <div key={keys} className="contents">
              <dt>
                <kbd className="rounded border border-line bg-tile px-1.5 py-0.5 font-mono text-[11.5px] whitespace-nowrap">{keys}</kbd>
              </dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
      )}
      {topic === 'about' && <p className="text-[13px] leading-relaxed">{t.footer}</p>}
    </DialogFrame>
  );
}
