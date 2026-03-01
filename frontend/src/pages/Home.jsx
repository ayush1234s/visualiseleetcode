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

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-12">

      {/* ================= HEATMAP ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 
                        shadow-md hover:shadow-xl hover:-translate-y-1 
                        transition-all duration-300">
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

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 
                        shadow-md hover:shadow-xl hover:-translate-y-1 
                        transition-all duration-300">
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
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 
                          shadow-md hover:shadow-xl hover:-translate-y-1 
                          transition-all duration-300">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Progress Overview
              </h2>

              <div className="flex gap-2 bg-[#0d1117] p-1 rounded-lg">
                {["leetcode", "codeforces"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgressTab(tab)}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      progressTab === tab
                        ? "bg-white text-black font-medium"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {progressTab === "leetcode" && (
              <>
                {!lcUsername ? (
                  <p className="text-red-400 text-sm">
                    Please add your LeetCode username.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {["easy", "medium", "hard"].map((level) => (
                      <div key={level}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize text-gray-300">
                            {level}
                          </span>
                          <span className="text-white">
                            {leetcodeData?.[level]}
                          </span>
                        </div>

                        <div className="w-full bg-[#0d1117] h-2 rounded-full">
                          <div
                            className="h-2 bg-white rounded-full transition-all duration-700"
                            style={{
                              width: `${percent(
                                leetcodeData?.[level],
                                totalLC
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {progressTab === "codeforces" && (
              <>
                {!cfUsername ? (
                  <p className="text-red-400 text-sm">
                    Please add your Codeforces username.
                  </p>
                ) : (
                  <div className="text-gray-300 text-sm">
                    Total Submissions:{" "}
                    <span className="text-white font-semibold text-lg">
                      {cfSubs.length}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* DAILY PROBLEM */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 
                          shadow-md hover:shadow-xl hover:-translate-y-1 
                          transition-all duration-300">

            <h2 className="text-lg font-semibold text-white mb-5">
              LeetCode Problem of the Day
            </h2>

            {!lcUsername ? (
              <p className="text-gray-500 text-sm">
                Add your LeetCode username to view.
              </p>
            ) : dailyProblem ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  {dailyProblem.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{dailyProblem.difficulty}</span>
                  <span>•</span>
                  <span>{dailyProblem.acceptanceRate}%</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dailyProblem.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-[#0d1117] border border-[#30363d] 
                                 px-2 py-1 text-xs rounded-md text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={dailyProblem.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-white text-black 
                             hover:bg-gray-200 transition 
                             py-2 rounded-lg font-medium"
                >
                  Solve Now
                </a>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Loading...</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - RECENT ACTIVITY */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 
                        shadow-md hover:shadow-xl hover:-translate-y-1 
                        transition-all duration-300">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>

            <div className="flex gap-2 bg-[#0d1117] p-1 rounded-lg">
              {["all", "leetcode", "codeforces"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRecentTab(tab)}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    recentTab === tab
                      ? "bg-white text-black font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {(recentTab === "all" || recentTab === "leetcode") &&
              leetcodeSubs.map((s, i) => (
                <div
                  key={`lc-${i}`}
                  className="bg-[#0d1117] border border-[#30363d] 
                             rounded-lg p-3 hover:bg-[#1f2937] transition"
                >
                  <p className="text-sm text-white">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.statusDisplay} • {s.lang}
                  </p>
                </div>
              ))}

            {(recentTab === "all" || recentTab === "codeforces") &&
              cfSubs.map((s, i) => (
                <div
                  key={`cf-${i}`}
                  className="bg-[#0d1117] border border-[#30363d] 
                             rounded-lg p-3 hover:bg-[#1f2937] transition"
                >
                  <p className="text-sm text-white">
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