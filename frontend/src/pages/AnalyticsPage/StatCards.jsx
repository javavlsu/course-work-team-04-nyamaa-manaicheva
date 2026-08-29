import { ChevronDown, ChevronUp } from "lucide-react";

import { analyticsStats } from "../../lib/utils/mockData";

function StatCards() {
  return (
    <div className="stat-row">
      {analyticsStats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <span className="stat-card-label">{stat.label}</span>
          <span
            className="stat-card-value"
            style={stat.accent ? { color: "var(--accent)" } : undefined}
          >
            {stat.value}
          </span>
          <span className={`stat-card-change ${stat.trend}`}>
            {stat.trend === "up" ? (
              <ChevronUp strokeWidth={2} />
            ) : (
              <ChevronDown strokeWidth={2} />
            )}
            {stat.change}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatCards;
