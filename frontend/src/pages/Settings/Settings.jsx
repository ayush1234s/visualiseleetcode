import { useState, useEffect } from "react";
import { db, auth } from "../../firebase"; // 🔥 added auth
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Linkedin, ExternalLink, User } from "lucide-react";
import Shimmer from "../../components/Shimmer/Shimmer";

export default function Settings() {
  const [leetcode, setLeetcode] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return; // 🔥 important
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid); // 🔥 FIX
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLeetcode(data.leetcodeUsername || "");
        setCodeforces(data.codeforcesUsername || "");
        setSavedData(data);
      }
    } catch {
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

      await setDoc(doc(db, "users", auth.currentUser.uid), newData); // 🔥 FIX
      setSavedData(newData);
      toast.success("Saved successfully 🚀");
    } catch {
      toast.error("Error saving data");
    }

    setLoading(false);
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

          {/* PROFILE CARD */}
          <div className="bg-[#161b22] border border-[#30363d]
                          rounded-xl p-6 transition-all duration-300
                          hover:shadow-lg hover:-translate-y-1
                          hover:border-[#58a6ff] cursor-pointer">

            {initialLoading ? (
              <>
                <Shimmer className="h-12 w-12 rounded-full mb-4" />
                <Shimmer className="h-4 w-40 mb-2" />
                <Shimmer className="h-3 w-24" />
              </>
            ) : (
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
            )}

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

          {/* FORM CARD */}
          <div className="bg-[#161b22] border border-[#30363d]
                          rounded-xl p-6 space-y-5">

            <h2 className="text-lg font-semibold text-white">
              Connect Profiles
            </h2>

            {initialLoading ? (
              <>
                <Shimmer className="h-10 w-full" />
                <Shimmer className="h-10 w-full" />
                <Shimmer className="h-10 w-32" />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}