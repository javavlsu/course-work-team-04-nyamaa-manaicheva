import { ResponsiveBar } from "@nivo/bar";

import { nivoTheme } from "../nivoTheme";

function DirectoryBars({ data }) {
  return (
    <ResponsiveBar
      data={data}
      keys={["value"]}
      indexBy="dir"
      margin={{ top: 8, right: 0, bottom: 24, left: 0 }}
      padding={0.3}
      layout="vertical"
      borderRadius={4}
      enableGridX={false}
      enableGridY={false}
      axisLeft={null}
      axisBottom={{ tickSize: 0, tickPadding: 10 }}
      colors={({ data }) =>
        data.colorKey === "primary"
          ? "var(--accent)"
          : "color-mix(in oklch, var(--accent) 30%, var(--border))"
      }
      enableLabel={false}
      isInteractive={false}
      theme={nivoTheme}
    />
  );
}

export default DirectoryBars;