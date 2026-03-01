const axios = require("axios");

const fetchLeetCodeContests = async () => {
  const apiURL =
    "https://api.allorigins.win/raw?url=https%3A%2F%2Fleetcode.com%2Fgraphql%3FoperationName%3DupcomingContests%26query%3Dquery%20upcomingContests%20%7B%20upcomingContests%7B%20title%20titleSlug%20startTime%20duration%20__typename%20%7D%7D";

  const response = await axios.get(apiURL);

  if (!response?.data?.data?.upcomingContests) return [];

  const result = response.data.data.upcomingContests.map((contest) => ({
    platform: "LeetCode",
    title: contest.title,
    titleSlug: contest.titleSlug,
    startTime: contest.startTime,
    duration: contest.duration,
    status: "upcoming",
    url: `https://leetcode.com/contest/${contest.titleSlug}`,
  }));

  return result;
};

module.exports = fetchLeetCodeContests;