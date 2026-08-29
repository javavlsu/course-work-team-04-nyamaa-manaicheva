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

function StarIcon({ filled, className, onClick }) {
  return (
    <svg
      {...svgProps}
      fill={filled ? "currentColor" : "none"}
      className={className}
      onClick={onClick}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

export { SearchIcon, StarIcon, SortIcon, FolderFillIcon };
