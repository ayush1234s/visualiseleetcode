export const fetchCodeforcesData = async (username) => {
  const res = await fetch(
    `http://localhost:5000/api/codeforces/${username}`
  );
  return await res.json();
};