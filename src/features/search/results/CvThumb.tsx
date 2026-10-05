/** Page 1 of the converted CV as a tiny inline SVG (no images to load). Paper-white in both themes. */
export function CvThumb({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 80 100"
      aria-hidden
      className={`rounded shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform duration-150 group-hover/thumb:-translate-y-0.5 ${className}`}
    >
      <rect x="0.5" y="0.5" width="79" height="99" rx="3" fill="#fff" stroke="rgba(0,0,0,0.1)" />
      <rect x="10" y="12" width="28" height="3" fill="#222" />
      <g fill="#c4c4c4">
        <rect x="10" y="21" width="60" height="1" />
        <rect x="10" y="27" width="44" height="1" />
        <rect x="10" y="44" width="60" height="1" />
        <rect x="10" y="50" width="60" height="1" />
        <rect x="10" y="67" width="60" height="1" />
        <rect x="10" y="73" width="40" height="1" />
      </g>
      <g fill="#FF4D64">
        <rect x="10" y="35" width="16" height="2" />
        <rect x="10" y="58" width="16" height="2" />
      </g>
    </svg>
  );
}
