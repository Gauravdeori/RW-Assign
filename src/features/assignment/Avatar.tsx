import { initials } from '../../lib/assignment';
import type { Recruiter } from '../../types';

/** Charcoal circle with the recruiter's initials. Decorative: the name is always written beside it. */
export function Avatar({ recruiter }: { recruiter: Pick<Recruiter, 'firstName' | 'lastName'> }) {
  return (
    <span
      aria-hidden
      className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-ink text-[13px] font-bold tracking-[0.02em] text-page"
    >
      {initials(recruiter.firstName, recruiter.lastName)}
    </span>
  );
}
