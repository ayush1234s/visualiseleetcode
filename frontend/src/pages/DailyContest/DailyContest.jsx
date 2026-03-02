import { useEffect, useState } from "react";
import { fetchAllContests } from "../../services/contestService";

export default function DailyContest() {
  const [contests, setContests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadContests = async () => {
    setLoading(true);
    const data = await fetchAllContests();
    const safeData = Array.isArray(data) ? data : [];
    setContests(safeData);
    setFiltered(safeData);
    setLoading(false);
  };

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    let result = contests;

    if (platform !== "all") {
      result = result.filter(
        (c) => c.platform?.toLowerCase() === platform
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

    window.open(googleUrl, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-4 gap-10">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-semibold text-white mb-6">
          Filter Contests
        </h2>

        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Platforms</h4>
          <div className="flex flex-wrap gap-2">
            {["all", "leetcode", "codeforces"].map((item) => (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  platform === item
                    ? "bg-white text-black border-white"
                    : "border-[#30363d] text-gray-400 hover:text-white hover:border-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Status</h4>
          <div className="flex flex-wrap gap-2">
            {["all", "upcoming", "ongoing", "past"].map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  status === item
                    ? "bg-white text-black border-white"
                    : "border-[#30363d] text-gray-400 hover:text-white hover:border-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadContests}
            className="flex-1 border border-white text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              setPlatform("all");
              setStatus("all");
            }}
            className="flex-1 border border-[#30363d] py-2 rounded-lg hover:border-white hover:text-white transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="lg:col-span-3 grid md:grid-cols-2 gap-8">
        {loading ? (
          <p className="text-gray-400">Loading contests...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400">No contests found.</p>
        ) : (
          filtered.map((contest, index) => (
            <div
              key={index}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-5 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#0d1117] border border-[#30363d] text-gray-300">
                  {contest.platform}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0d1117] border border-[#30363d] text-gray-400">
                  {contest.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white">
                {contest.title}
              </h3>

              <div className="space-y-2 text-sm text-gray-400">
                <p>Start: {formatTime(contest.startTime)}</p>
                <p>Duration: {formatDuration(contest.duration)} mins</p>
              </div>

              <div className="flex gap-4 pt-2">
                <a
                  href={contest.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center border border-white text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
                >
                  Join Contest
                </a>

                <button
                  onClick={() => handleAddToCalendar(contest)}
                  className="flex-1 border border-[#30363d] py-2 rounded-lg hover:border-white hover:text-white transition"
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