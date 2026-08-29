const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function ClipboardNotesIcon() {
  return (
    <svg {...svgProps}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M9 14h6" />
      <path d="M9 10h6" />
      <path d="M9 18h6" />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg {...svgProps}>
      <rect width="6" height="14" x="2" y="5" rx="1" />
      <rect width="6" height="10" x="9" y="7" rx="1" />
      <rect width="6" height="14" x="16" y="3" rx="1" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg {...svgProps}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

export { ClipboardNotesIcon, KanbanIcon, TrendIcon };
