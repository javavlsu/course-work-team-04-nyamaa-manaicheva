import { ResponsiveBar } from "@nivo/bar";

import { notesPerWeek } from "../../lib/utils/mockData";

function WeeklyBars() {
  return (
    <ResponsiveBar
      data={notesPerWeek}
      keys={["value"]}
      indexBy="week"
      margin={{ top: 8, right: 0, bottom: 24, left: 0 }}
      padding={0.3}
      layout="vertical"
      borderRadius={4}
      enableGridX={false}
      enableGridY={false}
      axisLeft={null}
      axisBottom={{ tickSize: 0, tickPadding: 10 }}
      colors="var(--accent)"
      enableLabel={false}
      isInteractive={false}
      theme={{
        axis: {
          ticks: {
            text: {
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fill: "var(--muted)",
            },
          },
        },
      }}
    />
  );
}

export default WeeklyBars;
