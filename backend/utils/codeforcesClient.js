const axios = require("axios");

exports.fetchCodeforcesSubmissions = async (username) => {
  const response = await axios.get(
    `https://codeforces.com/api/user.status?handle=${username}`
  );

  if (response.data.status !== "OK") return [];

  return response.data.result.slice(0, 50);
};

exports.fetchCodeforcesContests = async () => {
  const response = await axios.get(
    "https://codeforces.com/api/contest.list"
  );

  return response.data.result.map(c => {
    let status = "upcoming";
    if (c.phase === "CODING") status = "ongoing";
    if (c.phase === "FINISHED") status = "past";

    return {
      title: c.name,
      startTime: new Date(c.startTimeSeconds * 1000).toLocaleString(),
      duration: c.durationSeconds / 60,
      status,
      link: `https://codeforces.com/contest/${c.id}`
    };
  });
};