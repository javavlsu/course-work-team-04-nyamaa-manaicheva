function ChartPanel({ title, children, style }) {
  return (
    <div className="chart-panel" style={style}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default ChartPanel;
