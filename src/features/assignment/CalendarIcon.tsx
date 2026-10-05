/** Small calendar in front of a booked meeting time. */
export function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mr-1 inline-block h-3.5 w-3.5 -translate-y-px align-middle text-go"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
    </svg>
  );
}
