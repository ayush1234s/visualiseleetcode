const getCodeforcesContests = require("../Contests/codeforces");
const fetchLeetCodeContests = require("../Contests/leetcode");

exports.getAllContests = async (req, res) => {
  try {

    let lcArray = [];
    let cfArray = [];

    // 🔥 LeetCode safe call
    try {
      const lc = await fetchLeetCodeContests();
      lcArray = Array.isArray(lc) ? lc : [];
    } catch (err) {
      console.log("❌ LeetCode Error:", err.message);
    }

    // 🔥 Codeforces safe call
    try {
      const cf = await getCodeforcesContests();
      cfArray = Array.isArray(cf) ? cf : [];
    } catch (err) {
      console.log("❌ Codeforces Error:", err.message);
    }

    const finalData = [...lcArray, ...cfArray];

    console.log("✅ FINAL CONTEST COUNT:", finalData.length);

    res.json(finalData);

  } catch (error) {
    console.error("❌ Contest Fetch Fatal Error:", error.message);
    res.json([]);
  }
};