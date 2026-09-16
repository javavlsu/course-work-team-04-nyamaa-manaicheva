function ChartPanel({ title, children, style, className }) {
  return (
    <div className={`chart-panel${className ? ` ${className}` : ""}`} style={style}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default ChartPanel;
