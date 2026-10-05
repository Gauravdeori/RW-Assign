import { useI18n, type Dict } from '../../i18n';
import { ROLES, type Activity, type Role, type SettingKey } from '../../types';
import { DotHeading } from '../studio/DotHeading';
import { StudioCard } from '../studio/StudioCard';

/** Activity entries shown (the log keeps more). */
const SHOWN = 8;

const isRole = (v: string | undefined): v is Role => (ROLES as readonly (string | undefined)[]).includes(v);
const isSetting = (v: string | undefined): v is SettingKey => v === 'gender' || v === 'jd';

/** One activity entry in words, in the current language. */
export function describeActivity(x: Activity, a: Dict['admin']): string {
  switch (x.kind) {
    case 'export':
    case 'search':
    case 'assign':
    case 'reassign':
      return a.act[x.kind](x.a ?? '', x.b ?? '');
    case 'role':
      return a.act.role(x.a ?? '', isRole(x.b) ? a.role[x.b] : (x.b ?? ''));
    case 'settingOn':
    case 'settingOff':
      return a.act[x.kind](isSetting(x.a) ? a.setting[x.a] : (x.a ?? ''));
    case 'lang':
      return a.act.lang(x.a === 'en' || x.a === 'ja' ? a.langName[x.a] : (x.a ?? ''));
    case 'reset':
      return a.act.reset;
    default:
      return a.act[x.kind](x.a ?? '');
  }
}

/** Recent activity in the workspace, newest first. */
export function ActivityCard({ activity }: { activity: Activity[] }) {
  const { t } = useI18n();
  const a = t.admin;
  return (
    <StudioCard>
      <DotHeading>{a.activityTitle}</DotHeading>
      {activity.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted">{a.activityEmpty}</p>
      ) : (
        <ol className="mt-3">
          {activity.slice(0, SHOWN).map((x) => (
            <li key={x.id} className="flex gap-3 border-t border-card-line py-3 first:border-t-0">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
              <div className="min-w-0">
                <p className="text-[13px] leading-snug break-words">{describeActivity(x, a)}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">{a.ago(x.at)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </StudioCard>
  );
}
