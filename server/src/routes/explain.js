import { Router } from "express";
import multer from "multer";
import { explainMedicalText, extractMedicineNames } from "../services/gemini.js";
import { groundMedicines } from "../services/grounding.js";

const router = Router();

const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(), // nothing is written to disk
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGES.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPG, PNG or WebP images are allowed."));
  },
});

// POST /api/explain  (multipart/form-data: text?, language?, image?)
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const text = (req.body.text || "").trim().slice(0, 6000);
    const language = (req.body.language || "English").trim().slice(0, 40);

    if (!text && !req.file) {
      return res
        .status(400)
        .json({ error: "Paste some text or upload a photo to explain." });
    }

    const image = req.file
      ? { mimeType: req.file.mimetype, data: req.file.buffer.toString("base64") }
      : undefined;

    // 1) find medicine names, 2) verify them with RxNorm + openFDA, 3) explain
    const names = await extractMedicineNames({ text, image });
    const facts = await groundMedicines(names);
    const result = await explainMedicalText({ text, image, language, facts });

    res.json({
      ...result,
      verified: facts.map((f) => ({
        medicine: f.medicine,
        ingredient: f.ingredient,
        source: f.source,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
