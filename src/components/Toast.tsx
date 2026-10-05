/** Short confirmation at the bottom of the screen ("Saved …", "Exported …"). Announced to screen readers. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      {message && (
        <span className="anim-fade-up rounded-full border border-pick-line bg-pick px-4 py-2 text-[13px] font-semibold text-pick-ink shadow-hover">
          {message}
        </span>
      )}
    </div>
  );
}
