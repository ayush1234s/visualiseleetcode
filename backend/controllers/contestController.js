const getCodeforcesContests = require("../Contests/codeforces");
const fetchLeetCodeContests = require("../Contests/leetcode");

exports.getAllContests = async (req, res) => {
  try {
    const [lc, cf] = await Promise.all([
      fetchLeetCodeContests(),
      getCodeforcesContests(),
    ]);

    const lcArray = Array.isArray(lc) ? lc : [];
    const cfArray = Array.isArray(cf) ? cf : [];

    res.json([...lcArray, ...cfArray]);
  } catch (error) {
    console.error("Contest Fetch Error:", error.message);
    res.json([]);
  }
};