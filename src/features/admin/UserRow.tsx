import { TrashIcon } from '../../components/icons/TrashIcon';
import { useI18n } from '../../i18n';
import { CURRENT_USER } from '../../lib/conversions';
import { cx } from '../../lib/cx';
import { ROLES, type AdminUser, type Role } from '../../types';
import { PillSegmented } from '../studio/PillSegmented';

/** "Aiko Mori" -> "AM". */
export const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/** One user: initials, name, email, last active, status, role and actions (not for yourself). */
export function UserRow({
  u,
  onRole,
  onToggleStatus,
  onRemove,
}: {
  u: AdminUser;
  onRole: (role: Role) => void;
  /** Resend an invite, or activate / deactivate. */
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const a = t.admin;
  const self = u.name === CURRENT_USER;
  return (
    <li className="flex flex-col gap-3 border-t border-card-line py-4 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden
          className={cx(
            'flex h-10 w-10 flex-none items-center justify-center rounded-full border border-tile-line bg-tile text-[13px] font-semibold',
            u.status === 'deactivated' && 'text-muted',
          )}
        >
          {initials(u.name)}
        </span>
        <div className="min-w-0">
          <div className={cx('truncate text-[14px] font-medium', u.status === 'deactivated' && 'text-muted')}>
            {u.name} {self && <span className="font-normal text-muted">{a.you}</span>}
          </div>
          <div className="truncate text-[12.5px] text-muted">{u.email}</div>
          <div className="mt-0.5 text-[11.5px] text-muted">{u.lastActive ? a.lastActive(a.ago(u.lastActive)) : a.neverActive}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-[52px] md:pl-0">
        <span
          className={cx(
            'mono-caps inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[9.5px] whitespace-nowrap',
            u.status === 'active' && 'border-ok/70 text-ok',
            u.status === 'invited' && 'border-warn/70 text-warn',
            u.status === 'deactivated' && 'border-tile-line text-muted',
          )}
        >
          {a.status[u.status]}
        </span>
        {self ? (
          <span className="inline-flex h-8 items-center rounded-full border border-tile-line px-3 text-[12.5px] font-semibold">
            {a.role.admin}
          </span>
        ) : (
          <>
            <PillSegmented
              label={a.roleFor(u.name)}
              size="sm"
              value={u.role}
              onChange={onRole}
              options={ROLES.map((r) => ({ value: r, label: a.role[r] }))}
            />
            <button
              type="button"
              onClick={onToggleStatus}
              className="h-9 rounded-full border border-card-line bg-card px-3.5 text-[12.5px] font-semibold whitespace-nowrap hover:border-ink/50"
            >
              {u.status === 'invited' ? a.resend : u.status === 'active' ? a.deactivate : a.activate}
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={a.removeUser(u.name)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-line bg-card hover:border-accent hover:text-accent"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
