import { ResponsivePie } from "@nivo/pie";

import { progressData } from "../../lib/utils/mockData";

const pieData = [
  { id: "done", label: "Завершено", value: 75, color: "var(--accent)" },
  { id: "left", label: "Осталось", value: 25, color: "var(--border)" },
];

function ProgressDonut() {
  return (
    <div className="progress-container">
      <div className="progress-ring-wrap">
        <ResponsivePie
          data={pieData}
          innerRadius={0.72}
          padAngle={0}
          cornerRadius={0}
          colors={({ data }) => data.color}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          isInteractive={false}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <div className="progress-center">
          <span className="progress-pct">{progressData.percent}%</span>
          <span className="progress-label">выполнено</span>
        </div>
      </div>
      <div className="progress-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--accent)" }}></span>
          <span>Завершено</span>
          <span className="legend-count">{progressData.done}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--warning)" }}></span>
          <span>В работе</span>
          <span className="legend-count">{progressData.inProgress}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--border)" }}></span>
          <span>К выполнению</span>
          <span className="legend-count">{progressData.todo}</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressDonut;
