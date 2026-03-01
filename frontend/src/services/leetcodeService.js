export const fetchLeetCodeData = async (username) => {
  const res = await fetch(
    `http://localhost:5000/api/leetcode/${username}`
  );
  return await res.json();
};

export const fetchDailyProblem = async () => {
  const res = await fetch(
    `http://localhost:5000/api/leetcode/daily/problem`
  );
  return await res.json();
};

export const fetchRecentSubmissions = async (username) => {
  const res = await fetch(
    `http://localhost:5000/api/leetcode/recent/${username}`
  );
  return await res.json();
};