import { useState } from "react";
import InputForm from "./components/InputForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import LensDemo from "./components/LensDemo.jsx";
import { explain } from "./lib/api.js";

function Wordmark() {
  return (
    <div className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="#ffe243" strokeWidth="3" />
        <path d="M18.5 18.5 25 25" stroke="#ffe243" strokeWidth="3" strokeLinecap="round" />
      </svg>
      HealthLens
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");

  async function handleSubmit(payload) {
    setLanguage(payload.language);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await explain(payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="on-cobalt bg-cobalt text-white">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-6 sm:pb-16">
          <Wordmark />

          <div className="mt-10 grid items-center gap-10 md:mt-14 md:grid-cols-2 md:gap-12">
            <div>
              <h1 className="text-[clamp(2.5rem,8vw,4.6rem)] font-extrabold leading-[0.98] tracking-tight">
                Your prescription, in plain words.
              </h1>
              <p className="mt-5 max-w-md text-lg text-printed">
                Photograph or paste any medicine label. Get it back in simple language,
                in English, Pidgin, Yoruba, Hausa and more.
              </p>
              <a
                href="#explain"
                className="mt-7 inline-block rounded-full bg-marker px-7 py-3 font-display text-base font-extrabold text-ink transition hover:bg-white"
              >
                Explain my medicine
              </a>
            </div>

            <LensDemo />
          </div>
        </div>
      </div>

      <main id="explain" className="mx-auto max-w-2xl space-y-8 px-5 py-12">
        <InputForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div
            role="alert"
            className="rounded-xl border-2 border-signal bg-white p-4 text-sm font-medium text-signal"
          >
            {error}
          </div>
        )}

        {loading && (
          <p role="status" className="text-sm text-muted">
            Reading and checking your document. This takes a few seconds.
          </p>
        )}

        {result && <ResultCard result={result} language={language} />}
      </main>

      <footer className="mx-auto max-w-2xl border-t border-ink/10 px-5 py-8 text-sm leading-relaxed text-muted">
        HealthLens explains medical text in simple language. It does not diagnose,
        prescribe or replace a doctor or pharmacist. Never start, stop or change a
        medicine because of this explanation. In an emergency, go to the nearest clinic
        or hospital.
      </footer>
    </div>
  );
}
