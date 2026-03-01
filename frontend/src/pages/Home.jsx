import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

import Heatmap from "../components/Heatmap";

import {
  fetchLeetCodeData,
  fetchDailyProblem,
  fetchRecentSubmissions
} from "../services/leetcodeService";

import { fetchCodeforcesData } from "../services/codeforcesService";

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

            const subs =
              await fetchRecentSubmissions(lc);
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">

      {/* ================= TOP HEATMAP ROW ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* LC Heatmap */}
        <Heatmap
          platform="leetcode"
          data={
            leetcodeData?.calendar
              ? JSON.parse(leetcodeData.calendar)
              : {}
          }
        />

        {/* CF Heatmap */}
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

      {/* ================= SECOND ROW ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* ================= LEFT SIDE ================= */}
        <div className="space-y-8">

          {/* PROGRESS CARD */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Progress
            </h2>

            {/* Toggle */}
            <div className="flex gap-2">
              {["leetcode", "codeforces"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgressTab(tab)}
                    className={`px-3 py-1 rounded text-sm ${
                      progressTab === tab
                        ? "bg-blue-500 text-white"
                        : "bg-[#0d1117] text-gray-400"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* LeetCode Progress */}
            {progressTab === "leetcode" && (
              <>
                {!lcUsername ? (
                  <p className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
  <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500/20 text-xs font-bold">
    i
  </span>
  Please add your LeetCode username.
</p>
                ) : (
                  <>
                    {["easy", "medium", "hard"].map(
                      (level) => (
                        <div key={level}>
                          <div className="flex justify-between text-sm">
                            <span
                              className={
                                level === "easy"
                                  ? "text-green-400"
                                  : level === "medium"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }
                            >
                              {level}
                            </span>
                            <span>
                              {leetcodeData?.[level]}
                            </span>
                          </div>
                          <div className="w-full bg-[#0d1117] h-2 rounded mt-1">
                            <div
                              className={
                                level === "easy"
                                  ? "bg-green-500 h-2 rounded"
                                  : level === "medium"
                                  ? "bg-yellow-500 h-2 rounded"
                                  : "bg-red-500 h-2 rounded"
                              }
                              style={{
                                width: `${percent(
                                  leetcodeData?.[level],
                                  totalLC
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </>
            )}

            {/* Codeforces Progress */}
            {progressTab === "codeforces" && (
              <>
                {!cfUsername ? (
                 <p className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
  <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500/20 text-xs font-bold">
    i
  </span>
  Please add your Codeforces username.
</p>
                ) : (
                  <p className="text-sm">
                    Total Submissions: {cfSubs.length}
                  </p>
                )}
              </>
            )}
          </div>

        
        
          {/* ================= DAILY PROBLEM ================= */}
<div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4 hover:border-blue-500 transition">

  <h2 className="text-lg font-semibold text-blue-400">
    LeetCode Problem of the Day
  </h2>

  <p className="text-sm text-gray-400">
    Daily coding challenge
  </p>

  {!lcUsername ? (
    <p className="text-gray-500 text-sm">
      Note: Please add your LeetCode username.
    </p>
  ) : dailyProblem ? (
    <>
      {/* Title */}
      <h3 className="text-xl font-semibold">
        {dailyProblem.title}
      </h3>

      {/* Difficulty + Acceptance */}
      <div className="flex items-center gap-4 text-sm">
        <span
          className={`px-2 py-1 rounded text-xs ${
            dailyProblem.difficulty === "Easy"
              ? "bg-green-900 text-green-400"
              : dailyProblem.difficulty === "Medium"
              ? "bg-yellow-900 text-yellow-400"
              : "bg-red-900 text-red-400"
          }`}
        >
          {dailyProblem.difficulty}
        </span>

        <span className="text-gray-400">
          {dailyProblem.acceptanceRate}%
        </span>
      </div>

      {/* Problem ID */}
      <p className="text-sm text-gray-400">
        Problem #{dailyProblem.id} - Today's LeetCode Challenge
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {dailyProblem.tags.map((tag, i) => (
          <span
            key={i}
            className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-xs rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Button */}
      <a
        href={dailyProblem.link}
        target="_blank"
        rel="noreferrer"
        className="block text-center bg-blue-600 hover:bg-blue-500 transition py-2 rounded-lg"
      >
        Solve Now
      </a>
    </>
  ) : (
    <p>Loading...</p>
  )}
</div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Recent Activity
          </h2>

          {/* Toggle */}
          <div className="flex gap-2">
            {["all", "leetcode", "codeforces"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setRecentTab(tab)}
                  className={`px-3 py-1 rounded text-sm ${
                    recentTab === tab
                      ? "bg-blue-500 text-white"
                      : "bg-[#0d1117] text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {(recentTab === "all" ||
              recentTab === "leetcode") &&
              leetcodeSubs.map((s, i) => (
                <div
                  key={`lc-${i}`}
                  className="border-b border-[#30363d] pb-2"
                >
                  <p className="text-sm">{s.title}</p>
                  <p className="text-xs text-gray-400">
                    {s.statusDisplay} • {s.lang}
                  </p>
                </div>
              ))}

            {(recentTab === "all" ||
              recentTab === "codeforces") &&
              cfSubs.map((s, i) => (
                <div
                  key={`cf-${i}`}
                  className="border-b border-[#30363d] pb-2"
                >
                  <p className="text-sm">
                    {s.problem?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.verdict} • {s.programmingLanguage}
                  </p>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}