import { useEffect, useRef, useState } from "react";

export const LANGUAGES = [
  "English",
  "Nigerian Pidgin",
  "Yoruba",
  "Hausa",
  "Igbo",
  "French",
  "Swahili",
  "Arabic",
  "Spanish",
  "Portuguese",
];

const MAX_IMAGE_MB = 5;

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-2h6.6l1.2 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function InputForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [language, setLanguage] = useState("English");
  const [fileError, setFileError] = useState("");
  const fileRef = useRef(null);

  // Create and clean up the preview URL for the chosen photo
  useEffect(() => {
    if (!image) return setPreview(null);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFileError(`That photo is over ${MAX_IMAGE_MB}MB. Choose a smaller one.`);
      e.target.value = "";
      return;
    }
    setImage(file);
  }

  function removeImage() {
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (loading || (!text.trim() && !image)) return;
    onSubmit({ text: text.trim(), image, language });
  }

  const canSubmit = !loading && (text.trim() || image);

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <h2 className="text-3xl font-extrabold tracking-tight">Explain my medicine</h2>

      <div>
        <label htmlFor="text" className="block font-bold">
          Paste the text
        </label>
        <textarea
          id="text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={6000}
          placeholder="e.g. Amoxicillin 500mg, 1 capsule three times daily for 7 days after meals"
          className="mt-2 w-full resize-y rounded-2xl border-2 border-ink/20 bg-white p-4 text-base outline-none transition placeholder:text-muted/70 focus:border-cobalt"
        />
      </div>

      <div>
        <span className="block font-bold">Or use a photo</span>
        {preview ? (
          <div className="mt-2 flex items-center gap-4 rounded-2xl border-2 border-ink/20 bg-white p-3">
            <img
              src={preview}
              alt="Your selected document"
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{image?.name}</p>
              <button
                type="button"
                onClick={removeImage}
                className="text-sm font-bold text-signal underline underline-offset-2"
              >
                Remove photo
              </button>
            </div>
          </div>
        ) : (
          <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-cobalt/50 bg-white p-4 text-cobalt transition hover:border-cobalt hover:bg-cobalt/5 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-cobalt">
            <CameraIcon />
            <span className="font-bold">Take a photo or choose one</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
        )}
        {fileError && (
          <p role="alert" className="mt-2 text-sm font-medium text-signal">
            {fileError}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="font-bold">Explain it in</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <label key={l} className="cursor-pointer">
              <input
                type="radio"
                name="language"
                value={l}
                checked={language === l}
                onChange={() => setLanguage(l)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border-2 border-ink/20 bg-white px-4 py-2 text-sm font-bold transition hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
                {l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-cobalt px-8 py-4 font-display text-lg font-extrabold text-white transition hover:bg-cobalt-deep disabled:cursor-not-allowed disabled:bg-ink/20 sm:w-auto"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white"
            />
          )}
          {loading ? "Explaining" : "Explain this"}
        </button>
        <p className="mt-3 text-sm text-muted">
          Your text and photos are not saved. They are only used to make your
          explanation.
        </p>
      </div>
    </form>
  );
}
