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
  const [initialLoading, setInitialLoading] = useState(true);

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

    setInitialLoading(false);
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
      setSavedData(newData);
      toast.success("Usernames saved successfully 🚀");
    } catch (error) {
      toast.error("Error saving data");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Account Settings
          </h1>
          <p className="text-gray-400">
            Connect your coding profiles and track your journey.
          </p>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* PROFILE CARD */}
          <div className="group bg-[#161b22] border border-[#30363d] 
                          rounded-2xl p-8 shadow-md space-y-6
                          transition-all duration-300
                          hover:-translate-y-2 hover:shadow-2xl hover:border-white">

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
                         transition hover:border-white hover:text-white"
            >
              <Linkedin size={20} className="text-[#0A66C2]" />
              <span>View LinkedIn</span>
            </a>
          </div>

          {/* FORM CARD */}
          <div className="group bg-[#161b22] border border-[#30363d] 
                          rounded-2xl p-8 shadow-md space-y-6
                          transition-all duration-300
                          hover:-translate-y-2 hover:shadow-2xl hover:border-white">

            <h2 className="text-xl font-semibold">
              Connect Profiles
            </h2>

            <input
              type="text"
              placeholder="LeetCode Username"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-white transition"
            />

            <input
              type="text"
              placeholder="Codeforces Username"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-white transition"
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "border border-white text-white hover:bg-white hover:text-black"
                }
              `}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* SHIMMER OR TABLE */}
        {initialLoading ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-md">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[#30363d] rounded w-1/3"></div>
              <div className="h-4 bg-[#30363d] rounded w-full"></div>
              <div className="h-4 bg-[#30363d] rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          savedData && (
            <div className="group bg-[#161b22] border border-[#30363d] 
                            rounded-2xl p-8 shadow-md
                            transition-all duration-300
                            hover:-translate-y-2 hover:shadow-2xl hover:border-white">

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
                      <tr className="border-b border-[#30363d] hover:bg-[#0d1117] transition">
                        <td className="py-3">LeetCode</td>
                        <td className="py-3 text-white">
                          {savedData.leetcodeUsername}
                        </td>
                        <td className="py-3">
                          <a
                            href={`https://leetcode.com/${savedData.leetcodeUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white hover:underline"
                          >
                            Open <ExternalLink size={16} />
                          </a>
                        </td>
                      </tr>
                    )}

                    {savedData.codeforcesUsername && (
                      <tr className="border-b border-[#30363d] hover:bg-[#0d1117] transition">
                        <td className="py-3">Codeforces</td>
                        <td className="py-3 text-white">
                          {savedData.codeforcesUsername}
                        </td>
                        <td className="py-3">
                          <a
                            href={`https://codeforces.com/profile/${savedData.codeforcesUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white hover:underline"
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
          )
        )}

      </div>
    </div>
  );
}