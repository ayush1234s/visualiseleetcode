import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, fromUnixTime } from "date-fns";

const Heatmap = ({ data = {}, isUnix = true, platform = "leetcode", isLoading }) => {
  const safeData = data && typeof data === "object" ? data : {};
  const values = Object.entries(safeData).flatMap(([key, rawCount]) => {
    const isTimestamp = /^\d+$/.test(String(key));
    const date = isUnix && isTimestamp
      ? format(fromUnixTime(Number(key)), "yyyy-MM-dd")
      : String(key).slice(0, 10);
    const count = Number(rawCount) || 0;
    return date && !date.includes("NaN") ? [{ date, count }] : [];
  });
  const platformName = platform === "leetcode" ? "LeetCode" : "Codeforces";

  return (
    <div className="activity-heatmap min-w-[320px] xl:min-w-0">
      {isLoading ? (
        <div className="h-32 w-full animate-pulse rounded-lg bg-[#0d1117]" />
      ) : (
        <>
          <div className="min-w-[540px] sm:min-w-[620px] xl:min-w-[520px] 2xl:min-w-[620px] [&_.react-calendar-heatmap]:w-full [&_.react-calendar-heatmap_svg]:h-auto [&_.react-calendar-heatmap_svg]:w-full [&_.react-calendar-heatmap_rect]:rx-[3px] [&_.react-calendar-heatmap_rect]:ry-[3px] [&_.react-calendar-heatmap_text]:text-[10px] sm:[&_.react-calendar-heatmap_text]:text-[11px]">
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={values}
              showWeekdayLabels
              titleForValue={(value) => {
                if (!value?.date) return "No submissions";
                return `${value.count} ${value.count === 1 ? "submission" : "submissions"} on ${format(new Date(`${value.date}T12:00:00`), "MMM d, yyyy")}`;
              }}
              classForValue={(value) => {
                const count = Number(value?.count) || 0;
                const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
                return `activity-level-${level} activity-${platform === "leetcode" ? "leetcode" : "codeforces"}`;
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-gray-500" aria-label="Activity color scale">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => <span key={level} className={`activity-legend-cell activity-level-${level} activity-${platform === "leetcode" ? "leetcode" : "codeforces"}`} />)}
            <span>More</span>
            <span className="sr-only">Each square shows {platformName} submissions on one day.</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Heatmap;
