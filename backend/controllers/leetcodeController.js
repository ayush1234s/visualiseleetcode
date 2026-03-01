const {
  fetchUserStats,
  fetchDailyProblem,
  fetchRecentSubmissions,
  fetchLeetCodeContests
} = require("../utils/leetcodeClient");

exports.getUserDetails = async (req, res) => {
  try {
    const data = await fetchUserStats(req.params.username);
    res.json(data || {});
  } catch (err) {
    console.error("LeetCode User Error:", err.message);
    res.json({});
  }
};

exports.getDailyProblem = async (req, res) => {
  try {
    const data = await fetchDailyProblem();
    res.json(data || {});
  } catch (err) {
    console.error("LeetCode Daily Error:", err.message);
    res.json({});
  }
};

exports.getRecentSubmissions = async (req, res) => {
  try {
    const data = await fetchRecentSubmissions(req.params.username);
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("LeetCode Submission Error:", err.message);
    res.json([]);
  }
};

exports.getLeetCodeContests = async (req, res) => {
  try {
    const data = await fetchLeetCodeContests();

    // ✅ Always return array
    if (!Array.isArray(data)) {
      return res.json([]);
    }

    res.json(data);
  } catch (err) {
    console.error("LeetCode Contest Error:", err.message);
    res.json([]); // Never send error object
  }
};