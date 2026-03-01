const {
  fetchCodeforcesSubmissions
} = require("../utils/codeforcesClient");

const getCodeforcesSubmissions = async (req, res) => {
  try {
    const username = req.params.username;
    const data = await fetchCodeforcesSubmissions(username);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Codeforces data" });
  }
};

module.exports = {
  getCodeforcesSubmissions
};