import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CONFIG } from '../../config';
import { useI18n } from '../../i18n';
import { isValidEmail } from '../../lib/admin';
import { ROLES, type AdminUser, type Role } from '../../types';
import { PillSegmented } from '../studio/PillSegmented';

const inputCls =
  'h-11 w-full rounded-[10px] border border-tile-line bg-card px-3 text-[16px] text-ink outline-none focus:border-ink/60 sm:text-[14px]';

/** Invite a user: name, work email, role. Checks for a name, a valid email and duplicates. */
export function InviteForm({
  users,
  onInvite,
  onCancel,
}: {
  users: AdminUser[];
  onInvite: (u: { name: string; email: string; role: Role }) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const a = t.admin;
  const [form, setForm] = useState({ name: '', email: '', role: 'recruiter' as Role });
  const [error, setError] = useState<string | null>(null);
  const nameId = useId();
  const emailId = useId();
  const errorId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  // The name box takes focus once, when the form opens.
  useEffect(() => nameRef.current?.focus(), []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError(a.errName);
    if (!isValidEmail(email)) return setError(a.errEmail);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return setError(a.errDuplicate);
    onInvite({ name, email, role: form.role });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-describedby={error ? errorId : undefined}
      className="mt-4 rounded-[12px] border border-tile-line bg-tile p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={nameId} className="mb-1.5 block text-[12px] text-muted">
            {a.inviteName}
          </label>
          <input
            id={nameId}
            maxLength={CONFIG.textInputMaxLength}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            ref={nameRef}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={emailId} className="mb-1.5 block text-[12px] text-muted">
            {a.inviteEmail}
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="off"
            maxLength={CONFIG.textInputMaxLength}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1.5 text-[12px] text-muted">{a.inviteRole}</div>
        <PillSegmented
          label={a.inviteRole}
          size="sm"
          value={form.role}
          onChange={(role) => setForm({ ...form, role })}
          options={ROLES.map((r) => ({ value: r, label: a.role[r] }))}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-3 text-[13px] text-pick-ink">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button type="submit" className="h-10 rounded-full bg-accent px-5 text-[14px] font-bold text-on-accent hover:brightness-95">
          {a.sendInvite}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-full border border-card-line bg-card px-5 text-[14px] hover:border-ink/50"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
