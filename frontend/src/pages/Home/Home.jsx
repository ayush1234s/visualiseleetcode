// ONLY UI RESPONSIVE IMPROVED (LOGIC SAME)

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
          }

          if (cf) {
            const cfData = await fetchCodeforcesData(cf);
            setCfSubs(cfData || []);
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

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">
          Dashboard
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          See Your Coding Activity At A Glance.
        </p>
      </div>

      {/* HEATMAP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 overflow-x-auto">
          <h2 className="text-base sm:text-lg text-white mb-4">
            LeetCode Activity
          </h2>
          <Heatmap
            platform="leetcode"
            data={leetcodeData?.calendar ? JSON.parse(leetcodeData.calendar) : {}}
          />
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 overflow-x-auto">
          <h2 className="text-base sm:text-lg text-white mb-4">
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

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* PROGRESS */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">

            <div className="flex flex-wrap justify-between gap-3 mb-4">
              <h2 className="text-white">Progress Overview</h2>

              <div className="flex gap-2 flex-wrap">
                {["leetcode", "codeforces"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgressTab(tab)}
                    className={`px-3 py-1 text-xs rounded ${
                      progressTab === tab
                        ? "bg-[#1d252f] text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {["easy", "medium", "hard"].map((level) => (
              <div key={level} className="mb-4">
                <div className="flex justify-between text-sm">
                  <span>{level}</span>
                  <span>{leetcodeData?.[level] || 0}</span>
                </div>

                <div className="w-full bg-[#0d1117] h-2 rounded-full">
                  <div
                    className={`h-2 ${
                      level === "easy"
                        ? "bg-green-500"
                        : level === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${percent(leetcodeData?.[level], totalLC)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DAILY */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">

            <h2 className="text-white mb-3">
              Problem of the Day
            </h2>

            {dailyProblem && (
              <div className="space-y-3">

                <h3 className="text-white text-sm sm:text-lg">
                  {dailyProblem.title}
                </h3>

                <a
                  href={dailyProblem.link}
                  target="_blank"
                  className="inline-block bg-green-600 px-4 py-2 rounded"
                >
                  Solve
                </a>

              </div>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">

          <h2 className="text-white mb-4">
            Recent Activity
          </h2>

          <div className="space-y-3 max-h-[350px] overflow-y-auto">

            {leetcodeSubs.slice(0, 5).map((s, i) => (
              <div key={i} className="text-sm text-gray-300">
                {s.title}
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}