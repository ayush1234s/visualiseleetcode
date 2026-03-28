import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, fromUnixTime } from "date-fns";

const Heatmap = ({
  data = {},
  isUnix = true,
  platform = "leetcode",
  isLoading,
}) => {
  const safeData =
    data && typeof data === "object" ? data : {};

  const values = Object.keys(safeData).map((key) => ({
    date: isUnix
      ? format(fromUnixTime(Number(key)), "yyyy-MM-dd")
      : key,
    count: safeData[key],
  }));

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {isLoading ? (
        <div className="w-full h-32 bg-[#0d1117] animate-pulse rounded-lg" />
      ) : (
        <div className="w-full min-w-0 overflow-hidden">
          <div className="w-full min-w-0 overflow-hidden [&_.react-calendar-heatmap]:w-full [&_.react-calendar-heatmap]:h-auto [&_.react-calendar-heatmap_svg]:w-full [&_.react-calendar-heatmap_svg]:h-auto [&_.react-calendar-heatmap_svg]:max-w-full [&_.react-calendar-heatmap_rect]:rx-[2px] [&_.react-calendar-heatmap_rect]:ry-[2px] [&_.react-calendar-heatmap_text]:fill-[#8b949e] [&_.react-calendar-heatmap_text]:text-[8px] sm:[&_.react-calendar-heatmap_text]:text-[10px]">
            <CalendarHeatmap
              startDate={
                new Date(
                  new Date().setFullYear(
                    new Date().getFullYear() - 1
                  )
                )
              }
              endDate={new Date()}
              values={values}
              classForValue={(value) => {
                if (!value || value.count === 0)
                  return "fill-[#161b22] stroke-[#30363d]";

                if (value.count < 2)
                  return platform === "leetcode"
                    ? "fill-green-900"
                    : "fill-red-900";

                if (value.count < 4)
                  return platform === "leetcode"
                    ? "fill-green-700"
                    : "fill-red-700";

                if (value.count < 7)
                  return platform === "leetcode"
                    ? "fill-green-500"
                    : "fill-red-500";

                return platform === "leetcode"
                  ? "fill-green-400"
                  : "fill-red-400";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;