import { ResponsiveBar } from "@nivo/bar";

import { directoryNotes } from "../../lib/utils/mockData";

function DirectoryBars() {
  return (
    <ResponsiveBar
      data={directoryNotes}
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

export default DirectoryBars;
