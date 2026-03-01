const {
  fetchCodeforcesSubmissions,
  fetchCodeforcesContests
} = require("../utils/codeforcesClient");

exports.getCodeforcesSubmissions = async (req, res) => {
  try {
    const data = await fetchCodeforcesSubmissions(req.params.username);
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Codeforces User Error:", err.message);
    res.json([]);
  }
};

exports.getCodeforcesContests = async (req, res) => {
  try {
    const data = await fetchCodeforcesContests();

    if (!Array.isArray(data)) {
      return res.json([]);
    }

    res.json(data);
  } catch (err) {
    console.error("Codeforces Contest Error:", err.message);
    res.json([]);
  }
};