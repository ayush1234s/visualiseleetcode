import { useState } from "react";

export default function RecentActivity({ leetcode, codeforces }) {
  const [activeTab, setActiveTab] = useState("all");

  const lcSubs = leetcode?.submissions || [];
  const cfSubs = codeforces?.submissions || [];

  // Helper: time ago
  const timeAgo = (timestamp) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    const days = Math.floor(diff / 86400);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor(diff / 60);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const combined = [
    ...lcSubs.map((s) => ({
      platform: "LeetCode",
      title: s.title,
      status: s.statusDisplay,
      lang: s.lang,
      date: s.timestamp,
      questionId: s.questionId, // for question number
      url: `https://leetcode.com/problems/${s.titleSlug}/`,
    })),
    ...cfSubs.map((s) => ({
      platform: "Codeforces",
      title: s.problem.name,
      status: s.verdict,
      lang: s.programmingLanguage,
      date: s.creationTimeSeconds,
      questionId: `${s.problem.contestId}${s.problem.index}`,
      url: `https://codeforces.com/contest/${s.problem.contestId}/problem/${s.problem.index}`,
    })),
  ].sort((a, b) => b.date - a.date);

  const filtered =
    activeTab === "all"
      ? combined
      : activeTab === "leetcode"
      ? combined.filter((s) => s.platform === "LeetCode")
      : combined.filter((s) => s.platform === "Codeforces");

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-6">

      {/* Tabs */}
      <div className="flex gap-4">
        {["all", "leetcode", "codeforces"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeTab === tab
                ? "bg-[#0d1117] border border-[#30363d]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto space-y-3">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          filtered.slice(0, 20).map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-[#0d1117] px-4 py-3 rounded-lg border border-[#30363d] hover:border-white transition"
            >
              <div className="space-y-1">

                {/* Clickable Title */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-white hover:underline"
                >
                  {item.questionId && (
                    <span className="text-gray-400 mr-2">
                      #{item.questionId}
                    </span>
                  )}
                  {item.title}
                </a>

                <p className="text-xs text-gray-400">
                  {item.platform} • {item.lang} • {timeAgo(item.date)}
                </p>

              </div>

              <span
                className={`text-xs px-2 py-1 rounded-md ${
                  item.status === "Accepted" || item.status === "OK"
                    ? "bg-green-900 text-green-400"
                    : "bg-red-900 text-red-400"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}