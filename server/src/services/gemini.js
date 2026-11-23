import { GoogleGenAI } from "@google/genai";

let client;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are HealthLens, a health-literacy assistant. You turn confusing medical text
(prescriptions, drug leaflets, lab results, clinic notes) into simple language anyone can understand.

Rules:
- Explain only. NEVER diagnose, prescribe, or change a dose. Never tell the user to start or stop a medicine.
- Use short sentences and everyday words (reading level of a 12-year-old).
- If the text is unclear, unreadable, or not medical, say so in "summary" and return an empty "items" list.
- If verified facts are provided, base your explanation on them and do not contradict them.
- Always include warning signs that mean the user should seek care, and questions to ask a pharmacist or doctor.
- Write ALL user-facing text in the requested language.

Return ONLY valid JSON with exactly this shape:
{
  "summary": string,
  "items": [
    {
      "name": string,
      "type": "medicine" | "test" | "condition" | "other",
      "whatItIs": string,
      "howItIsUsed": string,
      "commonWarnings": string[]
    }
  ],
  "whenToSeekCare": string[],
  "questionsToAsk": string[]
}`;

/**
 * Pull out medicine names so they can be verified against official sources.
 * Returns [] on any failure, since grounding is best-effort.
 */
export async function extractMedicineNames({ text, image }) {
  try {
    const parts = [];
    if (image) {
      parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
    }
    parts.push({
      text: `List every medicine or drug name (brand or generic) in the following content.
Return ONLY a JSON array of strings, e.g. ["Amoxicillin","Panadol"]. Return [] if there are none.
${text ? `\nText:\n"""${text}"""` : "\nThe content is in the attached image."}`,
    });

    const response = await getClient().models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json", temperature: 0 },
    });

    const names = JSON.parse(response.text);
    return Array.isArray(names) ? names.filter((n) => typeof n === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Explain medical text and/or an image in plain language.
 * @param {object} opts
 * @param {string} [opts.text] pasted text
 * @param {{mimeType: string, data: string}} [opts.image] base64 image
 * @param {string} [opts.language] e.g. "English", "Nigerian Pidgin"
 * @param {object[]} [opts.facts] verified facts from health APIs (added later)
 */
export async function explainMedicalText({
  text,
  image,
  language = "English",
  facts = [],
}) {
  const parts = [];

  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }

  let prompt = `Language for the answer: ${language}\n`;
  if (text) prompt += `\nText from the user:\n"""${text}"""\n`;
  if (image) prompt += `\nThe attached image contains the medical document to explain.\n`;
  if (facts.length) {
    prompt += `\nVerified facts from official sources:\n${JSON.stringify(facts)}\n`;
  }
  parts.push({ text: prompt });

  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch {
    throw new Error("The AI returned an unreadable response. Please try again.");
  }
}
