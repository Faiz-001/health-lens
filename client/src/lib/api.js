// In production set VITE_API_URL to your deployed backend, e.g. https://healthlens-api.onrender.com
const API_URL = import.meta.env.VITE_API_URL || "";

export async function explain({ text, image, language }) {
  const body = new FormData();
  if (text) body.append("text", text);
  if (image) body.append("image", image);
  body.append("language", language);

  let res;
  try {
    res = await fetch(`${API_URL}/api/explain`, { method: "POST", body });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
