const BASE = "https://rxnav.nlm.nih.gov/REST";
const TIMEOUT = 5000;

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`RxNorm ${res.status}`);
  return res.json();
}

/**
 * Turn a typed or brand drug name (even slightly misspelled) into its
 * generic ingredient name, e.g. "Amoxil 500" -> "amoxicillin".
 * Returns null if nothing matches. Never throws.
 */
export async function findIngredient(drugName) {
  try {
    const approx = await getJson(
      `${BASE}/approximateTerm.json?term=${encodeURIComponent(drugName)}&maxEntries=1`
    );
    const rxcui = approx?.approximateGroup?.candidate?.[0]?.rxcui;
    if (!rxcui) return null;

    const related = await getJson(`${BASE}/rxcui/${rxcui}/related.json?tty=IN`);
    const groups = related?.relatedGroup?.conceptGroup || [];
    const ingredient = groups
      .flatMap((g) => g.conceptProperties || [])
      .map((p) => p.name)
      .find(Boolean);

    return ingredient ? { rxcui, ingredient: ingredient.toLowerCase() } : null;
  } catch {
    return null;
  }
}
