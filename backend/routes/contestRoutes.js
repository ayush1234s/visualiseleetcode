const axios = require("axios");

const fetchLeetCodeContests = async () => {
  try {
    const response = await axios.post("https://leetcode.com/graphql", {
      query: `
        query {
          upcomingContests {
            title
            titleSlug
            startTime
            duration
          }
        }
      `
    });

    const contests = response.data?.data?.upcomingContests || [];

    return contests.map((contest) => ({
      platform: "LeetCode",
      title: contest.title,
      titleSlug: contest.titleSlug,
      startTime: contest.startTime,
      duration: contest.duration,
      status: "upcoming",
      url: `https://leetcode.com/contest/${contest.titleSlug}`,
    }));

  } catch (err) {
    console.log("❌ LC API Error:", err.message);
    return [];
  }
};

module.exports = fetchLeetCodeContests;