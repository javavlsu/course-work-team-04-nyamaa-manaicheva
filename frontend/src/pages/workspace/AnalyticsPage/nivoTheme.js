export const nivoTheme = {
  background: "transparent",
  text: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fill: "var(--fg)",
  },
  axis: {
    domain: {
      line: {
        stroke: "var(--border)",
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: "var(--border)",
        strokeWidth: 1,
      },
      text: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fill: "var(--muted)",
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "var(--muted)",
      },
    },
  },
  grid: {
    line: {
      stroke: "var(--border)",
      strokeWidth: 1,
    },
  },
  labels: {
    text: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      fill: "var(--muted)",
    },
  },
  legends: {
    text: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fill: "var(--muted)",
    },
  },
  tooltip: {
    container: {
      background: "var(--surface)",
      color: "var(--fg)",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow)",
    },
  },
  crosshair: {
    line: {
      stroke: "var(--border)",
      strokeDasharray: "4 4",
    },
  },
};