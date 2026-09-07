const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
};

function SearchIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
}

function FolderFillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
    </svg>
  );
}

export { SearchIcon, SortIcon, FolderFillIcon };
