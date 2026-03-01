const axios = require("axios");

async function getCodeforcesContests() {
  const API = "https://codeforces.com/api/contest.list";

  const { data } = await axios.get(API);

  if (!data || data.status !== "OK") return [];

  const contests = data.result.map((contest) => ({
    platform: "Codeforces",
    title: contest.name,
    code: contest.id,
    startTime: contest.startTimeSeconds,
    duration: contest.durationSeconds,
    status: contest.phase === "BEFORE"
      ? "upcoming"
      : contest.phase === "CODING"
      ? "ongoing"
      : "past",
    url: `https://codeforces.com/contest/${contest.id}`,
  }));

  return contests;
}

module.exports = getCodeforcesContests;