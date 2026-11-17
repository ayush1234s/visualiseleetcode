import { API_BASE_URL } from "../config/api";

export const fetchAllContests = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contests`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Contest service returned ${res.status}.`);
    const data = await res.json();
    return Array.isArray(data) ? data : data?.contests || data?.result || [];
  } catch (err) {
    console.error("Contest fetch failed:", err);
    throw err;
  }
};
