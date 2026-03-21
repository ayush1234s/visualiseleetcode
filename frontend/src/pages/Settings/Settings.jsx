import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

import Heatmap from "../../components/Heatmap/Heatmap";
import { ExternalLink } from "lucide-react";

import {
  fetchLeetCodeData,
  fetchDailyProblem,
  fetchRecentSubmissions
} from "../../services/leetcodeService";

import { fetchCodeforcesData } from "../../services/codeforcesService";

export default function Home() {
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [dailyProblem, setDailyProblem] = useState(null);
  const [leetcodeSubs, setLeetcodeSubs] = useState([]);
  const [cfSubs, setCfSubs] = useState([]);

  const [lcUsername, setLcUsername] = useState(null);
  const [cfUsername, setCfUsername] = useState(null);

  const [progressTab, setProgressTab] = useState("leetcode");
  const [recentTab, setRecentTab] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", "config"),
      async (snap) => {
        if (snap.exists()) {
          const lc = snap.data().leetcodeUsername;
          const cf = snap.data().codeforcesUsername;

          setLcUsername(lc);
          setCfUsername(cf);

          if (lc) {
            const data = await fetchLeetCodeData(lc);
            setLeetcodeData(data);

            const daily = await fetchDailyProblem();
            setDailyProblem(daily);

            const subs = await fetchRecentSubmissions(lc);
            setLeetcodeSubs(subs || []);
          } else {
            setLeetcodeData(null);
            setDailyProblem(null);
            setLeetcodeSubs([]);
          }

          if (cf) {
            const cfData = await fetchCodeforcesData(cf);
            setCfSubs(cfData || []);
          } else {
            setCfSubs([]);
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const totalLC =
    (leetcodeData?.easy || 0) +
    (leetcodeData?.medium || 0) +
    (leetcodeData?.hard || 0);

  const percent = (val, total) =>
    total ? ((val / total) * 100).toFixed(1) : 0;

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-12">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">
          Dashboard
        </h1>
        <p className="text-gray-400">
          See Your Coding Activity At A Glance.
        </p>
      </div>

      {/* ================= HEATMAP ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6 text-white">
            LeetCode Activity
          </h2>
          <Heatmap
            platform="leetcode"
            data={
              leetcodeData?.calendar
                ? JSON.parse(leetcodeData.calendar)
                : {}
            }
          />
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6 text-white">
            Codeforces Activity
          </h2>
          <Heatmap
            platform="codeforces"
            data={
              cfSubs.length
                ? cfSubs.reduce((acc, sub) => {
                  const day = Math.floor(
                    new Date(sub.creationTimeSeconds * 1000)
                      .setHours(0, 0, 0, 0) / 1000
                  );
                  acc[day] = (acc[day] || 0) + 1;
                  return acc;
                }, {})
                : {}
            }
          />
        </div>
      </div>

      {/* ================= SECOND ROW ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* LEFT SIDE */}
        <div className="space-y-8">

          {/* PROGRESS */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Progress Overview
              </h2>

              <div className="flex gap-2 bg-[#0d1117] p-1 rounded-lg">
                {["leetcode", "codeforces"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgressTab(tab)}
                    className={`px-4 py-1 text-sm rounded-md border ${progressTab === tab
                        ? "bg-[#1d252f] text-white border-[#605e5e]"
                        : "border-[#30363d] text-gray-400 hover:text-white"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {progressTab === "leetcode" && (
              !lcUsername ? (
                <p className="text-red-400 text-sm">
                  Please add your LeetCode username.
                </p>
              ) : (
                ["easy", "medium", "hard"].map((level) => (
                  <div key={level} className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="capitalize text-white">
                        {level}
                      </span>
                      <span className="text-white">
                        {leetcodeData?.[level] || 0}
                      </span>
                    </div>
                    <div className="w-full bg-[#0d1117] h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${level === "easy"
                            ? "bg-green-500"
                            : level === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        style={{
                          width: `${percent(
                            leetcodeData?.[level],
                            totalLC
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )
            )}

            {progressTab === "codeforces" && (
              !cfUsername ? (
                <p className="text-red-400 text-sm">
                  Please add your Codeforces username.
                </p>
              ) : (
                <p className="text-white">
                  Total Submissions: {cfSubs.length}
                </p>
              )
            )}
          </div>

          {/* DAILY PROBLEM */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <h2 className="text-lg font-semibold text-white mb-5">
              LeetCode Problem of the Day
            </h2>

            {!lcUsername ? (
              <p className="text-gray-500 text-sm">
                Add your LeetCode username to view.
              </p>
            ) : dailyProblem ? (
              <div className="space-y-5">

                <div>
                  <h3 className="text-sm text-gray-400 mb-1">
                    Problem #{dailyProblem.questionId} - Today's LeetCode Challenge
                  </h3>

                  <h3 className="text-xl font-semibold text-white">
                    {dailyProblem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium
          ${dailyProblem.difficulty === "Easy"
                      ? "bg-green-900 text-green-400"
                      : dailyProblem.difficulty === "Medium"
                        ? "bg-yellow-900 text-yellow-400"
                        : "bg-red-900 text-red-400"
                    }`}>
                    {dailyProblem.difficulty}
                  </span>

                  <span className="text-gray-400">
                    {dailyProblem.acceptanceRate}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dailyProblem.tags?.map((tag, i) => (
                    <span key={i} className="bg-[#0d1117] border border-[#30363d] px-3 py-1 text-xs rounded-md text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={dailyProblem.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block border border-[#605e5e] text-white px-6 py-2 rounded-lg"
                >
                  Solve Now
                  <ExternalLink className="inline-block ml-2" size={18} />
                </a>

              </div>
            ) : (
              <p className="text-gray-400 text-sm">Loading...</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}