const BASE_URL = "http://localhost:5000/api";

export const fetchAllContests = async () => {
  try {
    const res = await fetch(`${BASE_URL}/contests`);
    return await res.json();
  } catch (err) {
    console.error("Contest Fetch Error:", err);
    return [];
  }
};