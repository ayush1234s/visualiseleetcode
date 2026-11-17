const getCodeforcesContests = require("../Contests/codeforces");
const fetchLeetCodeContests = require("../Contests/leetcode");

exports.getAllContests = async (req, res) => {
  try {
    // Each provider should fail independently so one upstream outage does not
    // hide contests from the other platform on the deployed site.
    const results = await Promise.allSettled([
      fetchLeetCodeContests(),
      getCodeforcesContests(),
    ]);
    const [lcResult, cfResult] = results;
    if (lcResult.status === "rejected") console.error("LeetCode contests unavailable:", lcResult.reason.message);
    if (cfResult.status === "rejected") console.error("Codeforces contests unavailable:", cfResult.reason.message);
    const contests = [
      ...(lcResult.status === "fulfilled" && Array.isArray(lcResult.value) ? lcResult.value : []),
      ...(cfResult.status === "fulfilled" && Array.isArray(cfResult.value) ? cfResult.value : []),
    ];
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(contests);

  } catch (error) {
    console.error("Contest Fetch Error:", error.message);
    res.json([]);
  }
};
