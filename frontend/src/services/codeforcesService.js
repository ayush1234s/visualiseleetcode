const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchAllContests = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/contests`);
    if (!res.ok) throw new Error("Contest fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Contest Fetch Error:", err);
    return [];
  }
};