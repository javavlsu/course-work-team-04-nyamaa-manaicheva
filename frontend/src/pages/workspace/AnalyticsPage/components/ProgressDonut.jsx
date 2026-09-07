import { ResponsivePie } from "@nivo/pie";

import { nivoTheme } from "../nivoTheme";

function ProgressDonut({ progress, data }) {
  return (
    <div className="progress-container">
      <div className="progress-ring-wrap">
        <ResponsivePie
          data={data}
          innerRadius={0.72}
          padAngle={0}
          cornerRadius={0}
          colors={({ data }) => data.color}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          isInteractive={false}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          theme={nivoTheme}
        />
        <div className="progress-center">
          <span className="progress-pct">{progress.percent}%</span>
          <span className="progress-label">выполнено</span>
        </div>
      </div>
      <div className="progress-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--accent)" }}></span>
          <span>Завершено</span>
          <span className="legend-count">{progress.done}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--warning)" }}></span>
          <span>В работе</span>
          <span className="legend-count">{progress.inProgress}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--border)" }}></span>
          <span>К выполнению</span>
          <span className="legend-count">{progress.todo}</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressDonut;