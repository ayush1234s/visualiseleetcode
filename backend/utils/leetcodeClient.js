const axios = require("axios");

const url = "https://leetcode.com/graphql";

const fetchUserStats = async (username) => {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        submissionCalendar
      }
    }
  `;

  const response = await axios.post(url, {
    query,
    variables: { username }
  });

  const user = response.data.data.matchedUser;

  if (!user) return null;

  const stats = user.submitStats.acSubmissionNum;

  return {
    totalSolved: stats[0].count,
    easy: stats[1].count,
    medium: stats[2].count,
    hard: stats[3].count,
    calendar: user.submissionCalendar
  };
};

const fetchDailyProblem = async () => {
  const query = `
    query {
      activeDailyCodingChallengeQuestion {
        question {
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          stats
        }
      }
    }
  `;

  const response = await axios.post(url, { query });

  const q =
    response.data.data.activeDailyCodingChallengeQuestion.question;

  const stats = JSON.parse(q.stats);

  return {
    id: q.questionFrontendId,
    title: q.title,
    difficulty: q.difficulty,
    acceptanceRate: stats.acRate,
    tags: q.topicTags.map((t) => t.name),
    link: `https://leetcode.com/problems/${q.titleSlug}`
  };
};

const fetchRecentSubmissions = async (username) => {
  const query = `
    query getUserProfile($username: String!, $limit: Int!) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  const response = await axios.post(url, {
    query,
    variables: { username, limit: 10 }
  });

  return response.data.data.recentSubmissionList;
};

module.exports = {
  fetchUserStats,
  fetchDailyProblem,
  fetchRecentSubmissions
};