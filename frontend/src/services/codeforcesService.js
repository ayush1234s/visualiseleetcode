import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

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
