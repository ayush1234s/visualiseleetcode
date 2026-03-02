import { useState } from "react";

export default function RecentActivity({ leetcode, codeforces }) {
  const [activeTab, setActiveTab] = useState("all");

  const lcSubs = leetcode?.submissions || [];
  const cfSubs = codeforces?.submissions || [];

  const combined = [
    ...lcSubs.map((s) => ({
      platform: "LeetCode",
      title: s.title,
      status: s.statusDisplay,
      lang: s.lang,
      date: s.timestamp,
    })),
    ...cfSubs.map((s) => ({
      platform: "Codeforces",
      title: s.problem.name,
      status: s.verdict,
      lang: s.programmingLanguage,
      date: s.creationTimeSeconds,
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
              className="flex justify-between items-center bg-[#0d1117] px-4 py-3 rounded-lg border border-[#30363d]"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-400">
                  {item.platform} • {item.lang}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}