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

// 🔥 USER ID (NO LOGIN)
const getUserId = () => {
  let uid = localStorage.getItem("userId");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("userId", uid);
  }
  return uid;
};

export default function Home() {
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [dailyProblem, setDailyProblem] = useState(null);
  const [leetcodeSubs, setLeetcodeSubs] = useState([]);
  const [cfSubs, setCfSubs] = useState([]);

  const [lcUsername, setLcUsername] = useState(null);
  const [cfUsername, setCfUsername] = useState(null);

  const [progressTab, setProgressTab] = useState("leetcode");
  const [recentTab, setRecentTab] = useState("all");

  const [initialLoading, setInitialLoading] = useState(false);

  // ✅ LOCAL STORAGE LOAD
  useEffect(() => {
    const lc = localStorage.getItem("leetcodeUsername");
    const cf = localStorage.getItem("codeforcesUsername");

    if (lc) setLcUsername(lc);
    if (cf) setCfUsername(cf);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", getUserId()),
      async (snap) => {
        if (snap.exists()) {
          const lc =
            snap.data().leetcodeUsername ||
            localStorage.getItem("leetcodeUsername");

          const cf =
            snap.data().codeforcesUsername ||
            localStorage.getItem("codeforcesUsername");

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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-14 space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 overflow-x-hidden">

      {/* HEADER */}
      <div className="space-y-2 px-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          See Your Coding Activity At A Glance.
        </p>
      </div>

      {/* ================= HEATMAP ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

        <div className="w-full min-w-0 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">
            LeetCode Activity
          </h2>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[280px]">
              <Heatmap
                platform="leetcode"
                data={
                  leetcodeData?.calendar
                    ? JSON.parse(leetcodeData.calendar)
                    : {}
                }
              />
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">
            Codeforces Activity
          </h2>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[280px]">
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
        </div>
      </div>

      {/* ================= SECOND ROW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

        {/* LEFT SIDE */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">

          {/* PROGRESS */}
          <div className="w-full min-w-0 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-white">
                Progress Overview
              </h2>

              <div className="flex flex-wrap gap-2 bg-[#0d1117] p-1 rounded-lg w-fit">
                {["leetcode", "codeforces"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgressTab(tab)}
                    className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md border transition-all duration-200 ${
                      progressTab === tab
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
                  <div key={level} className="mb-5 sm:mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="capitalize text-white">
                        {level}
                      </span>
                      <span className="text-white">
                        {leetcodeData?.[level] || 0}
                      </span>
                    </div>
                    <div className="w-full bg-[#0d1117] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          level === "easy"
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
                <p className="text-white text-sm sm:text-base">
                  Total Submissions: {cfSubs.length}
                </p>
              )
            )}
          </div>

          {/* DAILY PROBLEM */}
          <div className="w-full min-w-0 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">

            <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">
              LeetCode Problem of the Day
            </h2>

            {!lcUsername ? (
              <p className="text-gray-500 text-sm">
                Add your LeetCode username to view.
              </p>
            ) : dailyProblem ? (
              <div className="space-y-4 sm:space-y-5">

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm text-gray-400 mb-1 break-words">
                    Problem #{dailyProblem.questionId} - Today's LeetCode Challenge
                  </h3>

                  <h3 className="text-lg sm:text-xl font-semibold text-white break-words leading-snug">
                    {dailyProblem.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium
                    ${
                      dailyProblem.difficulty === "Easy"
                        ? "bg-green-900 text-green-400"
                        : dailyProblem.difficulty === "Medium"
                        ? "bg-yellow-900 text-yellow-400"
                        : "bg-red-900 text-red-400"
                    }`}
                  >
                    {dailyProblem.difficulty}
                  </span>

                  <span className="text-gray-400 text-xs sm:text-sm">
                    {dailyProblem.acceptanceRate}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dailyProblem.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-[#0d1117] border border-[#30363d] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs rounded-md text-gray-300 hover:border-white transition break-words"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={dailyProblem.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full sm:w-auto border border-[#605e5e] text-white px-5 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-[#1d252f] text-sm"
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

        {/* RIGHT SIDE RECENT ACTIVITY */}
        <div className="w-full min-w-0 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Recent Activity
            </h2>

            <div className="flex flex-wrap gap-2 bg-[#0d1117] p-1 rounded-lg w-fit">
              {["all", "leetcode", "codeforces"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRecentTab(tab)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 ${
                    recentTab === tab
                      ? "bg-[#1d252f] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 max-h-[460px] overflow-y-auto pr-1">

            {(recentTab === "all" || recentTab === "leetcode") &&
              [...leetcodeSubs]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((s, i) => (
                  <div
                    key={`lc-${i}`}
                    className="w-full min-w-0 bg-[#0d1117] p-3 sm:p-4 rounded-xl border border-[#30363d] overflow-hidden"
                  >
                    <a
                      href={`https://leetcode.com/problems/${s.titleSlug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-start gap-2 text-white hover:underline break-words leading-snug text-sm sm:text-base"
                    >
                      <span className="break-words">
                        #{s.questionId} {s.title}
                      </span>
                      <ExternalLink className="shrink-0 mt-0.5" size={16} />
                    </a>

                    <p className="text-xs text-gray-400 mt-2 break-words">
                      {s.lang} • {s.statusDisplay} • {timeAgo(s.timestamp)}
                    </p>
                  </div>
                ))}

            {(recentTab === "all" || recentTab === "codeforces") &&
              [...cfSubs]
                .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds)
                .map((s, i) => (
                  <div
                    key={`cf-${i}`}
                    className="w-full min-w-0 bg-[#0d1117] p-3 sm:p-4 rounded-xl border border-[#30363d] overflow-hidden"
                  >
                    <a
                      href={`https://codeforces.com/contest/${s.problem?.contestId}/problem/${s.problem?.index}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-start gap-2 text-white hover:underline break-words leading-snug text-sm sm:text-base"
                    >
                      <span className="break-words">
                        #{s.problem?.contestId}{s.problem?.index} {s.problem?.name}
                      </span>
                      <ExternalLink className="shrink-0 mt-0.5" size={16} />
                    </a>

                    <p className="text-xs text-gray-400 mt-2 break-words">
                      {s.programmingLanguage} • {s.verdict} • {timeAgo(s.creationTimeSeconds)}
                    </p>
                  </div>
                ))}

          </div>
        </div>

      </div>
    </div>
  );
}