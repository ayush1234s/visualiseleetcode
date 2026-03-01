const axios = require("axios");

const fetchCodeforcesSubmissions = async (username) => {
  const response = await axios.get(
    `https://codeforces.com/api/user.status?handle=${username}`
  );

  if (response.data.status !== "OK") return null;

  return response.data.result.slice(0, 50);
};

module.exports = {
  fetchCodeforcesSubmissions
};