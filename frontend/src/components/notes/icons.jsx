const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
};

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

export { StarIcon };
