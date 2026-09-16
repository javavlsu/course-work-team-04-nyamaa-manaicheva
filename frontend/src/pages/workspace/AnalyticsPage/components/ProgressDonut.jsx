import { ResponsivePie } from "@nivo/pie";

import { nivoTheme } from "../nivoTheme";

const STATUSES = [
  { label: "Завершено", countKey: "done", color: "var(--accent)" },
  { label: "В работе", countKey: "inProgress", color: "var(--muted)" },
  { label: "К выполнению", countKey: "todo", color: "var(--warning)" },
];

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
        </div>
      </div>
      <div className="progress-divider" />
      <div className="progress-columns">
        {STATUSES.map((status) => (
          <div className="progress-stat" key={status.label}>
            <span className="progress-stat-value">{progress[status.countKey]}</span>
            <div className="progress-status">
              <span className="progress-dot" style={{ background: status.color }} />
              <span className="progress-status-label">{status.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressDonut;