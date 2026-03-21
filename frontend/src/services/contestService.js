export const fetchAllContests = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contests`);
    const data = await res.json();

    console.log("🔥 RAW CONTEST RESPONSE:", data); // 👈 IMPORTANT

    return data;
  } catch (err) {
    console.error("Contest Fetch Error:", err);
    return [];
  }
};