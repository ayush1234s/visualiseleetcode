import { useEffect, useState } from "react";
import { fetchAllContests } from "../../services/contestService";
import { ExternalLink } from "lucide-react";

export default function DailyContest() {
  const [contests, setContests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadContests = async () => {
    setLoading(true);

    try {
      const data = await fetchAllContests();

      console.log("FULL API RESPONSE:", data);

      let safeData = [];

      // 🔥 HANDLE ALL API FORMATS
      if (Array.isArray(data)) {
        safeData = data;
      } else if (Array.isArray(data?.result)) {
        safeData = data.result;
      } else if (Array.isArray(data?.contests)) {
        safeData = data.contests;
      } else if (Array.isArray(data?.data)) {
        safeData = data.data;
      } else {
        safeData = [];
      }

      console.log("FINAL CONTEST LIST:", safeData);

      setContests(safeData);
      setFiltered(safeData);

    } catch (err) {
      console.log("Error fetching contests:", err);
      setContests([]);
      setFiltered([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    let result = contests;

    if (platform !== "all") {
      result = result.filter((c) =>
        c.platform?.toLowerCase().includes(platform)
      );
    }

    if (status !== "all") {
      result = result.filter(
        (c) => c.status?.toLowerCase() === status
      );
    }

    setFiltered(result);
  }, [platform, status, contests]);

  const formatTime = (unix) => {
    if (!unix) return "-";
    return new Date(unix * 1000).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-";
    return Math.floor(seconds / 60);
  };

  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "") + "Z";
  };

  const handleAddToCalendar = (contest) => {
    if (!contest.startTime || !contest.duration) return;

    const startDate = new Date(contest.startTime * 1000);
    const endDate = new Date(
      contest.startTime * 1000 + contest.duration * 1000
    );

    const start = formatGoogleDate(startDate);
    const end = formatGoogleDate(endDate);

    const googleUrl =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(contest.title) +
      "&dates=" + start + "/" + end +
      "&details=" +
      encodeURIComponent(
        `Platform: ${contest.platform}\n\nJoin here: ${contest.url}`
      ) +
      "&location=" + encodeURIComponent(contest.url);

    window.open(googleUrl,"_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-24 sm:pb-12 md:pb-16 grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8 lg:gap-10 overflow-x-hidden">
      
      {/* FILTER */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 h-fit">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-5 sm:mb-6">
          Filter Contests
        </h2>

        {/* PLATFORM */}
        <div className="mb-5 sm:mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Platforms</h4>
          <div className="flex flex-wrap gap-2">
            {["all", "leetcode", "codeforces"].map((item) => (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition-all duration-200 ${
                  platform === item
                    ? "bg-[#1d252f] text-white border-[#605e5e]"
                    : "border-[#30363d] text-gray-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS */}
        <div className="mb-5 sm:mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Status</h4>
          <div className="flex flex-wrap gap-2">
            {["all", "upcoming", "ongoing", "past"].map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition-all duration-200 ${
                  status === item
                    ? "bg-[#1d252f] text-white border-[#605e5e]"
                    : "border-[#30363d] text-gray-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ACTION */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
          <button
            onClick={loadContests}
            className="flex-1 border text-white py-2.5 rounded-lg text-sm"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              setPlatform("all");
              setStatus("all");
            }}
            className="flex-1 border py-2.5 rounded-lg text-sm text-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* CONTEST CARDS */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        {loading ? (
          <p className="text-gray-400 text-sm sm:text-base">Loading contests...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm sm:text-base">No contests found.</p>
        ) : (
          filtered.map((contest, index) => (
            <div
              key={index}
              className="w-full min-w-0 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5"
            >
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#0d1117] text-gray-300 break-words">
                  {contest.platform}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0d1117] text-gray-400 break-words">
                  {contest.status}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-white break-words leading-snug">
                {contest.title}
              </h3>

              <div className="text-sm text-gray-400 space-y-1 break-words">
                <p>Start: {formatTime(contest.startTime)}</p>
                <p>Duration: {formatDuration(contest.duration)} mins</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href={contest.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex justify-center items-center gap-2 text-center border text-white py-2.5 rounded-lg text-sm"
                >
                  Join Contest
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => handleAddToCalendar(contest)}
                  className="flex-1 border py-2.5 rounded-lg text-sm text-gray-300"
                >
                  Remind Me
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}