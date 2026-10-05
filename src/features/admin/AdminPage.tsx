import { useEffect, useState } from 'react';
import { CONFIG } from '../../config';
import { useI18n } from '../../i18n';
import { activeThisWeek, clearAdminStorage, loadActivity, loadUsers, newId, storeActivity, storeUsers } from '../../lib/admin';
import type { Activity, ActivityKind, AdminUser, AppSettings, SettingKey } from '../../types';
import { StatCards } from '../studio/StatCards';
import { DotHeading } from '../studio/DotHeading';
import { StudioCard } from '../studio/StudioCard';
import { ActivityCard } from './ActivityCard';
import { InviteForm } from './InviteForm';
import { ResetDialog } from './ResetDialog';
import { SettingsCard } from './SettingsCard';
import { UserRow } from './UserRow';

/**
 * Admin (dummy). Users and activity are sample data kept in the browser.
 * Search settings are real: they change the Search page straight away.
 */
export function AdminPage({
  settings,
  onSettings,
  conversionsCount,
  onResetOthers,
}: {
  settings: AppSettings;
  onSettings: (patch: Partial<AppSettings>) => void;
  conversionsCount: number;
  /** Resets saved searches, conversions and settings owned by the app. */
  onResetOthers: () => void;
}) {
  const { t } = useI18n();
  const a = t.admin;

  const [users, setUsers] = useState<AdminUser[]>(loadUsers);
  const [activity, setActivity] = useState<Activity[]>(loadActivity);
  useEffect(() => storeUsers(users), [users]);
  useEffect(() => storeActivity(activity), [activity]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), CONFIG.noticeMs);
    return () => clearTimeout(id);
  }, [notice]);

  const log = (kind: ActivityKind, x?: string, y?: string) =>
    setActivity((list) => [{ id: newId('a'), at: new Date().toISOString(), kind, a: x, b: y }, ...list]);
  const updateUser = (id: string, patch: Partial<AdminUser>) => setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const setSetting = (key: SettingKey, on: boolean) => {
    onSettings(key === 'gender' ? { showGender: on } : { showJdFill: on });
    log(on ? 'settingOn' : 'settingOff', key);
  };

  const reset = () => {
    onResetOthers();
    clearAdminStorage();
    setUsers(loadUsers());
    setActivity([{ id: newId('a'), at: new Date().toISOString(), kind: 'reset' }, ...loadActivity()]);
    setInviteOpen(false);
    setConfirmReset(false);
  };

  const stats = [
    { label: a.statUsers, value: users.length },
    { label: a.statActive, value: users.filter(activeThisWeek).length, accent: true },
    { label: a.statInvites, value: users.filter((u) => u.status === 'invited').length },
    { label: a.statConversions, value: conversionsCount },
  ];

  return (
    <div className="mx-auto max-w-[1220px]">
      <p className="mono-caps text-[11px] text-muted">{a.eyebrow}</p>
      <h1 className="mt-2 text-[34px] leading-tight font-extrabold tracking-tight sm:text-[44px]">{a.title}</h1>

      <StatCards stats={stats} />

      <div className="mt-5 grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <StudioCard>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DotHeading>{a.usersTitle}</DotHeading>
              <p className="mt-1 text-[13px] text-muted">{a.usersSub}</p>
            </div>
            {!inviteOpen && (
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="h-10 rounded-full bg-accent px-5 text-[14px] font-bold text-on-accent hover:brightness-95"
              >
                {a.invite}
              </button>
            )}
          </div>

          {notice && (
            <p role="status" className="mt-4 rounded-[10px] border border-ok/40 bg-ok/10 px-3.5 py-2.5 text-[13px]">
              {notice}
            </p>
          )}

          {inviteOpen && (
            <InviteForm
              users={users}
              onCancel={() => setInviteOpen(false)}
              onInvite={({ name, email, role }) => {
                setUsers((list) => [...list, { id: newId('u'), name, email, role, status: 'invited', lastActive: null }]);
                log('invite', name);
                setNotice(a.invited(name));
                setInviteOpen(false);
              }}
            />
          )}

          <ul className="mt-4">
            {users.map((u) => (
              <UserRow
                key={u.id}
                u={u}
                onRole={(role) => {
                  updateUser(u.id, { role });
                  log('role', u.name, role);
                }}
                onToggleStatus={() => {
                  if (u.status === 'invited') {
                    log('resend', u.name);
                    setNotice(a.invited(u.name));
                  } else {
                    const next = u.status === 'active' ? 'deactivated' : 'active';
                    updateUser(u.id, { status: next });
                    log(next === 'active' ? 'activate' : 'deactivate', u.name);
                  }
                }}
                onRemove={() => {
                  setUsers((list) => list.filter((x) => x.id !== u.id));
                  log('remove', u.name);
                }}
              />
            ))}
          </ul>
        </StudioCard>

        <div className="flex flex-col gap-4 sm:gap-5">
          <SettingsCard
            settings={settings}
            onToggle={setSetting}
            onLang={(l) => {
              onSettings({ defaultLang: l });
              log('lang', l);
            }}
          />
          <ActivityCard activity={activity} />
          <StudioCard>
            <DotHeading>{a.demoTitle}</DotHeading>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{a.demoSub}</p>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="mt-4 h-10 rounded-full border border-ink/70 px-5 text-[14px] font-semibold hover:border-accent hover:text-accent"
            >
              {a.reset}
            </button>
          </StudioCard>
        </div>
      </div>

      {confirmReset && <ResetDialog onCancel={() => setConfirmReset(false)} onConfirm={reset} />}
    </div>
  );
}
