const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = async (url, method = "GET", data, userId) => {
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": userId || "",
  };
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || res.statusText);
  return json;
};
