const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchLeetCodeData = async (username) => {
  try {
    const res = await fetch(`${BASE_URL}/api/leetcode/${username}`);
    if (!res.ok) throw new Error("LeetCode data fetch failed");
    return await res.json();
  } catch (err) {
    console.error("LeetCode Error:", err);
    return null;
  }
};

export const fetchDailyProblem = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/leetcode/daily/problem`);
    if (!res.ok) throw new Error("Daily problem fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Daily Problem Error:", err);
    return null;
  }
};

export const fetchRecentSubmissions = async (username) => {
  try {
    const res = await fetch(`${BASE_URL}/api/leetcode/recent/${username}`);
    if (!res.ok) throw new Error("Submissions fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Submissions Error:", err);
    return [];
  }
};