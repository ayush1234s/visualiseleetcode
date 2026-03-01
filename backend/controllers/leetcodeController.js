const {
  fetchUserStats,
  fetchDailyProblem,
  fetchRecentSubmissions
} = require("../utils/leetcodeClient");

const getUserDetails = async (req, res) => {
  try {
    const username = req.params.username;
    const data = await fetchUserStats(username);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch LeetCode data" });
  }
};

const getDailyProblem = async (req, res) => {
  try {
    const data = await fetchDailyProblem();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Daily Problem" });
  }
};

const getRecentSubmissions = async (req, res) => {
  try {
    const username = req.params.username;
    const data = await fetchRecentSubmissions(username);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

module.exports = {
  getUserDetails,
  getDailyProblem,
  getRecentSubmissions
};