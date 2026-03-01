import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Github, Linkedin } from "lucide-react";

export default function Settings() {
  const [leetcode, setLeetcode] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const docRef = doc(db, "users", "config");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLeetcode(docSnap.data().leetcodeUsername || "");
        setCodeforces(docSnap.data().codeforcesUsername || "");
      }
    }
    fetchData();
  }, []);

  async function handleSave() {
    if (!leetcode && !codeforces) {
      toast.error("Enter at least one username");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "users", "config"), {
        leetcodeUsername: leetcode,
        codeforcesUsername: codeforces,
      });

      toast.success("Usernames saved successfully 🚀");
    } catch (error) {
      toast.error("Error saving data");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* PROFILE CARD */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">
            Hello, Ayush Srivastava 👋
          </h2>

          <p className="text-gray-400 mb-6">
            Configure your coding profiles to visualize your journey.
          </p>

          <a
            href="https://www.linkedin.com/in/ayushsrivastava06/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#0d1117] border border-[#30363d] px-4 py-3 rounded-lg 
                       hover:bg-[#1f2937] transition"
          >
            <Linkedin className="text-[#0A66C2]" />
            <span>LinkedIn Profile</span>
          </a>
        </div>

        {/* FORM CARD */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-xl space-y-6">
          <h2 className="text-xl font-semibold">
            Connect Your Profiles
          </h2>

          <input
            type="text"
            placeholder="LeetCode Username"
            value={leetcode}
            onChange={(e) => setLeetcode(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
          />

          <input
            type="text"
            placeholder="Codeforces Username"
            value={codeforces}
            onChange={(e) => setCodeforces(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff5555]"
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] transition px-6 py-3 rounded-lg text-white font-medium"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* INFO SECTION BELOW */}
      <div className="mt-12 bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-semibold">
          How It Works
        </h3>

        <ul className="text-gray-400 space-y-2 text-sm">
          <li>
            • LeetCode data fetched using <span className="text-[#58a6ff]">@leetnotion/leetcode-api</span>
          </li>
          <li>
            • Codeforces data fetched using official Codeforces API
          </li>
          <li>
            • Data updates automatically when username changes
          </li>
          <li>
            • No dummy data — real activity only
          </li>
        </ul>
      </div>

    </div>
  );
}