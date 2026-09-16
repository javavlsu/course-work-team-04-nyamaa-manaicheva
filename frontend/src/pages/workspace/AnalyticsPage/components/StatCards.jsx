import { ChevronDown, ChevronUp } from "lucide-react";

function StatCards({ stats }) {
  return (
    <div className="stat-row">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <span className="stat-card-label">{stat.label}</span>
          <span
            className={`stat-card-value${stat.accent ? " accent" : stat.warning ? " warning" : ""}`}
          >
            {stat.value}
          </span>
          {stat.change && (
            <span className={`stat-card-change ${stat.trend}`}>
              {stat.trend === "up" ? (
                <ChevronUp strokeWidth={2} />
              ) : (
                <ChevronDown strokeWidth={2} />
              )}
              {stat.change}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default StatCards;