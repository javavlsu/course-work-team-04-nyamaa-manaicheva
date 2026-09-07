import { ResponsiveBar } from "@nivo/bar";

import { nivoTheme } from "../nivoTheme";

function WeeklyBars({ data }) {
  return (
    <ResponsiveBar
      data={data}
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
      theme={nivoTheme}
    />
  );
}

export default WeeklyBars;