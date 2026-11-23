import { findIngredient } from "./rxnorm.js";
import { getDrugLabel } from "./openfda.js";

const MAX_MEDICINES = 5;

/**
 * For each medicine name, look up its generic ingredient (RxNorm) and the
 * official label (openFDA). Medicines that can't be verified are skipped, so
 * the AI only receives facts that really came from an official source.
 */
export async function groundMedicines(names = []) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))].slice(
    0,
    MAX_MEDICINES
  );

  const results = await Promise.all(
    unique.map(async (name) => {
      const match = await findIngredient(name);
      if (!match) return null;

      const label = await getDrugLabel(match.ingredient);
      if (!label) return null;

      return {
        medicine: name,
        ingredient: match.ingredient,
        source: "RxNorm (NLM) + openFDA drug label",
        ...label,
      };
    })
  );

  return results.filter(Boolean);
}
