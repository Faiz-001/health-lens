# HealthLens

**Understand your medicine in plain language, in your own language.**

HealthLens turns confusing prescriptions, drug leaflets and lab results into simple explanations that anyone can read, in languages such as English, Nigerian Pidgin, Yoruba, Hausa and Igbo. It checks medicine information against official drug labels, so explanations aren't based on an AI's guess alone.

- **Live demo:** `(https://health-lens-wine.vercel.app)`
- **Hackathon:** Acodemic x KeebsforWater Global SDG Hackathon

## The problem

Medical information is usually written in dense, technical English. Many people struggle to understand their prescriptions, dosage instructions and warnings, especially those with limited health literacy or who don't speak the language the documents are written in. Misunderstanding a medicine can lead to missed doses, wrong use or ignored warning signs, and people without easy access to a doctor or pharmacist are the most exposed.

## The solution

1. The user pastes text or takes a photo of a prescription, leaflet or test result.
2. The app identifies the medicines and verifies them against official sources.
3. It explains everything in short, simple sentences in the user's chosen language.
4. It lists warning signs that mean "get medical help" and questions to ask a pharmacist or doctor.
5. A read-aloud button helps people who find reading difficult.

HealthLens only explains. It never diagnoses, prescribes or tells anyone to start, stop or change a medicine.

## Who it's for

- People with limited health literacy or limited access to health professionals
- Speakers of languages that medical documents rarely use
- Caregivers managing medicines for family members
- Older adults and people with low vision (large text and read-aloud)

## SDG alignment

| SDG | How HealthLens contributes |
| --- | --- |
| **SDG 3: Good Health and Well-being** | Supports safe, correct use of medicines and earlier recognition of warning signs (health literacy and access to essential medicine information). |
| **SDG 10: Reduced Inequalities** | Removes language and literacy barriers to health information. |
| **SDG 4: Quality Education** | Builds everyday health literacy by explaining, not just translating. |

## Key features

- Text input and photo upload (camera on mobile)
- Plain-language explanations in 10 languages
- Medicine verification with RxNorm and openFDA drug labels, shown with a visible "verified" badge
- "Get medical help if..." warning box and questions to ask a professional
- Read-aloud using the browser's built-in speech
- Privacy by design: no accounts, no database, nothing stored
- Rate limiting and input validation on the API

## Tech stack

**Frontend:** React 19, Vite, Tailwind CSS v4, Web Speech API
**Backend:** Node.js, Express, Multer, express-rate-limit
**AI:** Google Gemini API (text and image understanding)
**Health data:** RxNorm API (NLM), openFDA Drug Label API
**Hosting:** Vercel or Netlify (frontend), Render (backend)

## How it works

```
React app ──(text/photo + language)──> Express API
                                         │ 1. Gemini extracts medicine names
                                         │ 2. RxNorm finds the generic ingredient
                                         │ 3. openFDA returns the official label
                                         │ 4. Gemini explains it in simple language
React app <──(structured JSON + verified list)──┘
```

## Run it locally

Requires Node.js 20 or newer and a free Gemini API key from https://aistudio.google.com.

```bash
# backend
cd server
npm install
cp .env.example .env      # add your GEMINI_API_KEY
npm run dev               # http://localhost:5000

# frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## Deployment

**Backend (Render):** create a Web Service from this repo using `render.yaml` (or set root directory `server`, build `npm install`, start `npm start`). Add the environment variables `GEMINI_API_KEY`, `GEMINI_MODEL` and `CLIENT_ORIGIN` (your frontend URL).

**Frontend (Vercel/Netlify):** set the root directory to `client`, build command `npm run build`, output directory `dist`, and the environment variable `VITE_API_URL` to your Render backend URL.

## Limitations and responsible use

- HealthLens is an educational tool, not medical advice. It does not replace a doctor or pharmacist.
- Verification uses US FDA labels, so some locally branded medicines may not be matched. In that case the app says the explanation is general.
- AI can make mistakes, especially in languages with less training data. The app encourages users to confirm with a professional.
- Photos must be clear and well lit for best results.

## Future work

- Local drug databases (for example NAFDAC) for better coverage of regional brands
- Offline-friendly PWA for low-connectivity areas
- Dosage reminder export and caregiver sharing
- Human review of translations by native-speaking health workers

## License

MIT
