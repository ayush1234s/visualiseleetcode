import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Linkedin, ExternalLink } from "lucide-react";

export default function Settings() {
  const [leetcode, setLeetcode] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const docRef = doc(db, "users", "config");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setLeetcode(data.leetcodeUsername || "");
      setCodeforces(data.codeforcesUsername || "");
      setSavedData(data);
    }
  }

  async function handleSave() {
    if (!leetcode && !codeforces) {
      toast.error("Enter at least one username");
      return;
    }

    setLoading(true);

    try {
      const newData = {
        leetcodeUsername: leetcode,
        codeforcesUsername: codeforces,
      };

      await setDoc(doc(db, "users", "config"), newData);

      setSavedData(newData); // update UI instantly
      toast.success("Usernames saved successfully 🚀");
    } catch (error) {
      toast.error("Error saving data");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#0f172a] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-400">
            Connect your coding profiles and track your journey.
          </p>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* PROFILE CARD */}
          <div className="bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d] rounded-2xl p-8 shadow-xl space-y-6">
            <h2 className="text-2xl font-semibold">
              Hello, Ayush Srivastava 👋
            </h2>

            <p className="text-gray-400 text-sm">
              Add your competitive coding usernames below.
            </p>

            <a
              href="https://www.linkedin.com/in/ayushsrivastava06/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#0d1117] border border-[#30363d] px-5 py-3 rounded-xl 
                         hover:bg-[#1f2937] hover:border-blue-500 transition"
            >
              <Linkedin size={20} className="text-[#0A66C2]" />
              <span>View LinkedIn</span>
            </a>
          </div>

          {/* FORM */}
          <div className="bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d] rounded-2xl p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-semibold">
              Connect Profiles
            </h2>

            <input
              type="text"
              placeholder="LeetCode Username"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              type="text"
              placeholder="Codeforces Username"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition 
                ${loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:scale-[1.02]"}
              `}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* SAVED USER TABLE */}
        {savedData && (
          <div className="bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d] rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-semibold mb-6">
              Connected Profiles
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-[#30363d]">
                    <th className="py-3">Platform</th>
                    <th className="py-3">Username</th>
                    <th className="py-3">Profile Link</th>
                  </tr>
                </thead>
                <tbody>

                  {savedData.leetcodeUsername && (
                    <tr className="border-b border-[#30363d]">
                      <td className="py-3">LeetCode</td>
                      <td className="py-3 text-blue-400">
                        {savedData.leetcodeUsername}
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://leetcode.com/${savedData.leetcodeUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-400 hover:underline"
                        >
                          Open <ExternalLink size={16} />
                        </a>
                      </td>
                    </tr>
                  )}

                  {savedData.codeforcesUsername && (
                    <tr className="border-b border-[#30363d]">
                      <td className="py-3">Codeforces</td>
                      <td className="py-3 text-rose-400">
                        {savedData.codeforcesUsername}
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://codeforces.com/profile/${savedData.codeforcesUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-400 hover:underline"
                        >
                          Open <ExternalLink size={16} />
                        </a>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}