const BASE = "https://api.fda.gov/drug/label.json";
const TIMEOUT = 6000;
const MAX_CHARS = 700; // keep the AI prompt small

const clip = (field) => {
  const text = Array.isArray(field) ? field[0] : field;
  if (!text || typeof text !== "string") return undefined;
  return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}...` : text;
};

/**
 * Fetch the official FDA label sections for a generic drug name.
 * Returns null if not found or the API is unreachable. Never throws.
 */
export async function getDrugLabel(genericName) {
  try {
    const safe = genericName.replace(/["\\]/g, "").trim();
    if (!safe) return null;

    const url = `${BASE}?search=openfda.generic_name:"${encodeURIComponent(safe)}"&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;

    const label = (await res.json())?.results?.[0];
    if (!label) return null;

    return {
      boxedWarning: clip(label.boxed_warning),
      indications: clip(label.indications_and_usage),
      warnings: clip(label.warnings || label.warnings_and_cautions),
      adverseReactions: clip(label.adverse_reactions),
      interactions: clip(label.drug_interactions),
    };
  } catch {
    return null;
  }
}
