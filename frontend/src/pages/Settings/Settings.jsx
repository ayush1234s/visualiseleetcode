import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";

import {
  User,
  Linkedin,
  Github,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Laptop,
  Moon,
  Sun,
  ShieldCheck,
  Code,
} from "lucide-react";
import { SiLeetcode, SiCodeforces } from "react-icons/si";
import { useTheme } from "../../context/ThemeContext";

// 🔥 USER ID (NO LOGIN)
const getUserId = () => {
  let uid = localStorage.getItem("userId");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("userId", uid);
  }
  return uid;
};

export default function Settings() {
  const [leetcode, setLeetcode] = useState(
    localStorage.getItem("leetcodeUsername") || ""
  );
  const [codeforces, setCodeforces] = useState(
    localStorage.getItem("codeforcesUsername") || ""
  );

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", getUserId()), (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        const lc =
          data.leetcodeUsername || localStorage.getItem("leetcodeUsername");
        const cf =
          data.codeforcesUsername || localStorage.getItem("codeforcesUsername");

        setLeetcode(lc || "");
        setCodeforces(cf || "");

        let arr = [];
        if (lc) arr.push({ site: "LeetCode", username: lc });
        if (cf) arr.push({ site: "Codeforces", username: cf });
        setTableData(arr);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const uid = getUserId();
      await setDoc(doc(db, "users", uid), {
        leetcodeUsername: leetcode.trim(),
        codeforcesUsername: codeforces.trim(),
      });

      localStorage.setItem("leetcodeUsername", leetcode.trim());
      localStorage.setItem("codeforcesUsername", codeforces.trim());
      toast.success("Profiles saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Could not save handles. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (site) => {
    const uid = getUserId();
    let lc = leetcode;
    let cf = codeforces;

    if (site === "LeetCode") {
      lc = "";
      setLeetcode("");
      localStorage.removeItem("leetcodeUsername");
    }
    if (site === "Codeforces") {
      cf = "";
      setCodeforces("");
      localStorage.removeItem("codeforcesUsername");
    }

    try {
      await setDoc(doc(db, "users", uid), {
        leetcodeUsername: lc,
        codeforcesUsername: cf,
      });
      toast.success(`${site} handle removed`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to remove ${site}`);
    }
  };

  const getProfileLink = (site, username) => {
    if (site === "LeetCode") return `https://leetcode.com/${username}/`;
    if (site === "Codeforces") return `https://codeforces.com/profile/${username}`;
    return "#";
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 overflow-x-hidden">
      
      {/* ================= PAGE HEADER & THEME TOGGLE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#30363d]/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Profile & Accounts
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Connect your competitive programming handles to sync heatmaps and submission history.
          </p>
        </div>

        {/* THEME SWITCHER TAB (Linear / macOS segmented pill) */}
        <div className="bg-[#161b22] border border-[#30363d] p-1 rounded-xl flex items-center shadow-sm self-start sm:self-auto">
          {[
            { id: "system", label: "System", icon: Laptop },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "light", label: "Light", icon: Sun },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = theme === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTheme(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#21262d] text-white shadow-sm border border-[#30363d]"
                    : "text-gray-400 hover:text-white hover:bg-[#21262d]/50"
                }`}
              >
                <Icon size={14} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= PROFILE & CONNECT GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* DEVELOPER CARD (5 cols) */}
        <div className="md:col-span-5 bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#21262d] border border-[#30363d] flex items-center justify-center font-bold text-lg text-blue-400 shrink-0">
                AS
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                  Ayush Srivastava
                </h2>
                <p className="text-xs text-blue-400 font-medium">
                  Developer • Visualize LeetCode
                </p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Passionate about building developer tools that make data structures and algorithms intuitive and approachable.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#30363d]/60 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
                <span className="text-gray-500 block text-[11px]">Synced Platforms</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {tableData.length} Connected
                </span>
              </div>
              <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
                <span className="text-gray-500 block text-[11px]">Interface Mode</span>
                <span className="text-white font-semibold mt-0.5 block capitalize">
                  {resolvedTheme}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <a
              href="https://www.linkedin.com/in/ayushsrivastava06/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#30363d] bg-[#0d1117] hover:bg-[#21262d] text-white text-xs font-medium transition cursor-pointer"
            >
              <Linkedin size={15} className="text-[#0a66c2]" />
              <span>LinkedIn</span>
              <ExternalLink size={12} className="opacity-50" />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-[#30363d] bg-[#0d1117] hover:bg-[#21262d] text-gray-300 hover:text-white transition cursor-pointer"
              title="GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </div>

        {/* CONNECT PROFILES FORM (7 cols) */}
        <div className="md:col-span-7 bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code size={18} className="text-blue-400" />
              Connect Profiles
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Enter your public usernames to pull recent solves and contest rankings into your home dashboard.
            </p>

            <form onSubmit={handleSave} className="space-y-4 mt-5">
              {/* LeetCode */}
              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5">
                  <SiLeetcode className="text-[#ffa116]" size={14} />
                  LeetCode Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. ayush_06"
                  value={leetcode}
                  onChange={(e) => setLeetcode(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none transition"
                />
              </div>

              {/* Codeforces */}
              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5">
                  <SiCodeforces className="text-[#3b82f6]" size={14} />
                  Codeforces Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. tourist"
                  value={codeforces}
                  onChange={(e) => setCodeforces(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none transition"
                />
              </div>
            </form>
          </div>

          <div className="pt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-[#21262d] hover:bg-[#161b22] text-gray-200 hover:text-white border border-[#30363d] hover:border-gray-500 font-medium px-5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Handles"}
            </button>
          </div>
        </div>

      </div>

      {/* ================= CONNECTED HANDLES TABLE ================= */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-400" size={18} />
              Connected Handles
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Verified accounts linked with this browser session.
            </p>
          </div>
        </div>

        {tableData.length === 0 ? (
          <div className="text-center py-8 bg-[#0d1117] rounded-xl border border-dashed border-[#30363d]">
            <p className="text-xs sm:text-sm text-gray-400">
              No profiles added yet. Connect your LeetCode or Codeforces handle above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#30363d]">
            <table className="min-w-[560px] w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0d1117] text-gray-400 font-semibold border-b border-[#30363d]">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {tableData.map((item, index) => (
                  <tr key={item.site} className="hover:bg-[#21262d]/40 transition">
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-medium text-white">
                        {item.site === "LeetCode" ? (
                          <SiLeetcode className="text-[#ffa116]" size={16} />
                        ) : (
                          <SiCodeforces className="text-[#3b82f6]" size={16} />
                        )}
                        <span>{item.site}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <a
                        href={getProfileLink(item.site, item.username)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-400 hover:underline font-mono text-xs sm:text-sm"
                      >
                        <span>{item.username}</span>
                        <ExternalLink size={12} className="opacity-60" />
                      </a>
                    </td>

                    {/* CRAZY VERIFIED BADGE */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full crazy-verified-badge text-white font-semibold text-xs tracking-wide shadow-md">
                        <CheckCircle2 size={13} className="text-white drop-shadow" />
                        <span className="tracking-wide text-[11px] font-bold">
                          Verified
                        </span>
                        <span className="text-[10px] bg-white/20 px-1 rounded-full font-mono">
                          ✓
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.site)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
