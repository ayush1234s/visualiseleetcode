const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchCodeforcesData = async (username) => {
  try {
    const res = await fetch(`${BASE_URL}/api/codeforces/${username}`);
    if (!res.ok) throw new Error("Codeforces fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Codeforces Error:", err);
    return [];
  }
};