import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

import { User, Linkedin } from "lucide-react";
import { SiLeetcode, SiCodeforces } from "react-icons/si";

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

  // 🔥 LOAD DATA
  useEffect(() => {

    const unsubscribe = onSnapshot(
      doc(db, "users", getUserId()),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          const lc =
            data.leetcodeUsername ||
            localStorage.getItem("leetcodeUsername");

          const cf =
            data.codeforcesUsername ||
            localStorage.getItem("codeforcesUsername");

          setLeetcode(lc || "");
          setCodeforces(cf || "");

          let arr = [];

          if (lc) {
            arr.push({
              site: "LeetCode",
              username: lc
            });
          }

          if (cf) {
            arr.push({
              site: "Codeforces",
              username: cf
            });
          }

          setTableData(arr);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔥 SAVE
  const handleSave = async () => {
    setLoading(true);

    try {
      const uid = getUserId();

      await setDoc(doc(db, "users", uid), {
        leetcodeUsername: leetcode,
        codeforcesUsername: codeforces,
      });

      localStorage.setItem("leetcodeUsername", leetcode);
      localStorage.setItem("codeforcesUsername", codeforces);

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // 🔥 DELETE
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

    await setDoc(doc(db, "users", uid), {
      leetcodeUsername: lc,
      codeforcesUsername: cf,
    });
  };

  // 🔥 PROFILE LINK FUNCTION
  const getProfileLink = (site, username) => {
    if (site === "LeetCode") {
      return `https://leetcode.com/${username}/`;
    }
    if (site === "Codeforces") {
      return `https://codeforces.com/profile/${username}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">
            Account Settings
          </h1>
          <p className="text-gray-400">
            Manage your connected coding accounts.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT PROFILE CARD */}
          <div className="bg-[#161b22] border border-[#30363d]
                          rounded-xl p-6 transition-all duration-300
                          hover:shadow-lg hover:-translate-y-1
                          hover:border-[#58a6ff] cursor-pointer">

            <div className="flex items-center gap-4">
              <div className="bg-[#21262d] p-3 rounded-full">
                <User size={26} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Ayush Srivastava
                </h2>
                <p className="text-sm text-gray-400">
                  Hello! I'm Ayush, the developer of Visualize Leet Code.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <a
                href="https://www.linkedin.com/in/ayushsrivastava06/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-12 w-full max-w-md inline-flex justify-center items-center gap-3 text-lg
               border border-[#30363d] px-6 py-3 rounded-lg
               hover:border-[#58a6ff] hover:text-white 
               transition-all duration-300"
              >
                <Linkedin size={30} />
                LinkedIn
              </a>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-[#161b22] border border-[#30363d]
                          rounded-xl p-6 space-y-5">

            <h2 className="text-lg font-semibold text-white">
              Connect Profiles
            </h2>

            <input
              type="text"
              placeholder="LeetCode Username"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-md px-3 py-2"
            />

            <input
              type="text"
              placeholder="Codeforces Username"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-md px-3 py-2"
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#238636] px-4 py-2 rounded-md text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* 🔥 TABLE */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">

          <h2 className="text-lg font-semibold text-white mb-4">
            Connected Accounts
          </h2>

          {tableData.length === 0 ? (
            <p className="text-gray-400">No usernames added.</p>
          ) : (
            <table className="w-full border border-[#30363d] text-left">
              <thead>
                <tr className="bg-[#0d1117]">
                  <th className="p-3 border border-[#30363d]">S.No.</th>
                  <th className="p-3 border border-[#30363d]">Site</th>
                  <th className="p-3 border border-[#30363d]">Username</th>
                  <th className="p-3 border border-[#30363d]">Action</th>
                </tr>
              </thead>

              <tbody>
                {tableData.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3 border border-[#30363d]">
                      {index + 1}
                    </td>

                    {/* SITE WITH LOGO */}
                    <td className="p-3 border border-[#30363d]">
                      <div className="flex items-center gap-2">

                        {item.site === "LeetCode" && (
                          <SiLeetcode className="text-yellow-400" size={18} />
                        )}

                        {item.site === "Codeforces" && (
                          <SiCodeforces className="text-blue-400" size={18} />
                        )}

                        {item.site}
                      </div>
                    </td>

                    {/* USERNAME CLICKABLE + VERIFIED */}
                    <td className="p-3 border border-[#30363d]">
                      <a
                        href={getProfileLink(item.site, item.username)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-2"
                      >
                        {item.username}

                        {/* VERIFIED BADGE */}
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          ✔ Verified
                        </span>
                      </a>
                    </td>

                    {/* DELETE */}
                    <td className="p-3 border border-[#30363d]">
                      <button
                        onClick={() => handleDelete(item.site)}
                        className="bg-red-600 px-3 py-1 rounded text-white"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>

      </div>
    </div>
  );
}