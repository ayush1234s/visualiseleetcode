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
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-6">

      <h2 className="text-lg font-semibold text-white">
        {platform === "leetcode"
          ? "LeetCode Activity"
          : "Codeforces Activity"}
      </h2>

      {isLoading ? (
        <div className="w-full h-32 bg-[#0d1117] animate-pulse rounded-lg" />
      ) : (
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
      )}
    </div>
  );
};

export default Heatmap;