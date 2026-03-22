const getCodeforcesContests = require("../Contests/codeforces");
const fetchLeetCodeContests = require("../Contests/leetcode");

exports.getAllContests = async (req, res) => {
  try {
    const [lc, cf] = await Promise.all([
      fetchLeetCodeContests(),
      getCodeforcesContests(),
    ]);

    console.log("LC:", lc.length);
    console.log("CF:", cf.length);

    res.json([...(lc || []), ...(cf || [])]);

  } catch (error) {
    console.error("Contest Fetch Error:", error.message);
    res.json([]);
  }
};