import { useState, useEffect } from "react";
import { db } from "../../firebase";
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

  const fetchData = async () => {
    try {
      const docRef = doc(db, "users", "config");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLeetcode(data.leetcodeUsername || "");
        setCodeforces(data.codeforcesUsername || "");
        setSavedData(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching data");
    }

    setInitialLoading(false);
  };

  const handleSave = async () => {
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
      console.error("Save error:", error);
      toast.error("Error saving data");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-gray-400">
            Connect your coding profiles and track your journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Left Card */}
          <div className="bg-[#161b22] border border-[#30363d]
                          rounded-2xl p-8 shadow-md space-y-6
                          hover:-translate-y-2 hover:shadow-2xl
                          hover:border-white transition">

            <h2 className="text-2xl font-semibold">
              Hello, Ayush 👋
            </h2>

            <p className="text-gray-400 text-sm">
              Add your competitive coding usernames below.
            </p>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3
                         bg-[#0d1117] border border-[#30363d]
                         px-5 py-3 rounded-xl
                         hover:border-white hover:text-white transition"
            >
              <Linkedin size={20} className="text-[#0A66C2]" />
              View LinkedIn
            </a>
          </div>

          {/* Form Card */}
          <div className="bg-[#161b22] border border-[#30363d]
                          rounded-2xl p-8 shadow-md space-y-6
                          hover:-translate-y-2 hover:shadow-2xl
                          hover:border-white transition">

            <h2 className="text-xl font-semibold">Connect Profiles</h2>

            <input
              type="text"
              placeholder="LeetCode Username"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2
                         focus:ring-white transition"
            />

            <input
              type="text"
              placeholder="Codeforces Username"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2
                         focus:ring-white transition"
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition
                ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "border border-white text-white hover:bg-white hover:text-black"
                }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Connected Profiles */}
        {initialLoading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          savedData && (
            <div className="bg-[#161b22] border border-[#30363d]
                            rounded-2xl p-8 shadow-md
                            hover:-translate-y-2 hover:shadow-2xl
                            hover:border-white transition">

              <h3 className="text-lg font-semibold mb-6">
                Connected Profiles
              </h3>

              <div className="space-y-4 text-sm">

                {savedData.leetcodeUsername && (
                  <div className="flex justify-between">
                    <span>LeetCode</span>
                    <a
                      href={`https://leetcode.com/${savedData.leetcodeUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      {savedData.leetcodeUsername}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {savedData.codeforcesUsername && (
                  <div className="flex justify-between">
                    <span>Codeforces</span>
                    <a
                      href={`https://codeforces.com/profile/${savedData.codeforcesUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      {savedData.codeforcesUsername}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}