import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";

import {
  Linkedin,
  Github,
  BadgeCheck,
  Check,
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
  const [connectionSuccess, setConnectionSuccess] = useState([]);
  const successTimer = useRef(null);

  const { theme, setTheme, resolvedTheme, tokens } = useTheme();

  useEffect(() => () => window.clearTimeout(successTimer.current), []);

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
      const connected = [
        leetcode.trim() && { site: "LeetCode", username: leetcode.trim() },
        codeforces.trim() && { site: "Codeforces", username: codeforces.trim() },
      ].filter(Boolean);
      setConnectionSuccess(connected);
      window.clearTimeout(successTimer.current);
      if (connected.length) {
        successTimer.current = window.setTimeout(() => setConnectionSuccess([]), 4000);
      }
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
      <div className={`${tokens.surface} ${tokens.border} border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-base font-bold ${tokens.text} flex items-center gap-2`}>
              <ShieldCheck className="text-blue-500" size={18} />
              Connected Handles
            </h2>
            <p className={`text-xs ${tokens.muted} mt-1`}>
              Your coding profiles connected to this browser.
            </p>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border ${tokens.border} ${tokens.inset} px-3 py-1.5 text-xs font-medium ${tokens.secondary}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {tableData.length} {tableData.length === 1 ? "profile" : "profiles"} connected
          </span>
        </div>

        {connectionSuccess.length > 0 && (
          <div className="profile-save-success flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 sm:p-4 dark:border-emerald-400/20 dark:bg-emerald-500/[0.08]" role="status" aria-live="polite">
            <span className="profile-save-check shrink-0"><Check size={25} strokeWidth={3} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Handles connected successfully</p>
              <p className="mt-0.5 truncate text-xs text-emerald-700/80 dark:text-emerald-200/70">
                {connectionSuccess.map(({ site, username }) => `${site} · ${username}`).join("  /  ")}
              </p>
            </div>
            <BadgeCheck className="hidden shrink-0 text-emerald-500 sm:block" size={22} />
          </div>
        )}

        {tableData.length === 0 ? (
          <div className={`text-center py-9 ${tokens.inset} rounded-xl border border-dashed ${tokens.border}`}>
            <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tokens.subtle} ${tokens.muted}`}><Code size={18} /></div>
            <p className={`text-xs sm:text-sm ${tokens.secondary} font-medium`}>
              No profiles added yet. Connect your LeetCode or Codeforces handle above.
            </p>
            <p className={`mt-1 text-xs ${tokens.muted}`}>Your linked profiles will appear here.</p>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-xl border ${tokens.border}`}>
            <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-left text-xs sm:text-sm">
              <thead className={`${tokens.inset} ${tokens.muted} font-semibold border-b ${tokens.border}`}>
                <tr>
                  <th className="py-3.5 px-4 w-12 font-medium">#</th>
                  <th className="py-3.5 px-4 font-medium">Platform</th>
                  <th className="py-3.5 px-4 font-medium">Username</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className={`${tokens.divider} divide-y`}>
                {tableData.map((item, index) => (
                  // Freshly saved handles get a one-time confirmation animation.
                  <tr key={item.site} className={`${tokens.hover} transition-colors`}>
                    <td className={`py-4 px-4 ${tokens.muted} font-mono text-xs`}>
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className={`flex items-center gap-2.5 font-medium ${tokens.text}`}>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tokens.border} ${tokens.inset}`}>
                        {item.site === "LeetCode" ? (
                          <SiLeetcode className="text-[#ffa116]" size={16} />
                        ) : (
                          <SiCodeforces className="text-[#3b82f6]" size={16} />
                        )}
                        </span>
                        <span>{item.site}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <a
                        href={getProfileLink(item.site, item.username)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-600 hover:underline font-mono text-xs sm:text-sm"
                      >
                        <span>{item.username}</span>
                        <ExternalLink size={12} className="opacity-60" />
                      </a>
                    </td>

                    {/* VERIFIED BADGE */}
                    <td className="py-3.5 px-4">
                      <div className={`verified-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-semibold text-xs tracking-wide ${connectionSuccess.some((connected) => connected.site === item.site) ? "verified-badge--celebrating" : ""}`}>
                        <BadgeCheck size={16} className="verified-badge-icon" aria-hidden="true" />
                        <span className="tracking-wide text-[11px] font-bold">
                          Verified
                        </span>
                        <span className="hidden">
                          ✓
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.site)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
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
          </div>
        )}
      </div>

    </div>
  );
}
