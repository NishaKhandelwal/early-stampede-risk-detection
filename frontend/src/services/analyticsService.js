const API = "http://127.0.0.1:5000";

export async function getAnalytics() {
    const res = await fetch(`${API}/analytics`);

    if (!res.ok) {
        throw new Error("Failed to load analytics");
    }

    return await res.json();
}