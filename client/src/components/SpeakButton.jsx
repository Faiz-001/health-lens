import { useEffect, useState } from "react";

// Browser speech codes for the languages offered in the form
const VOICE_LANG = {
  English: "en-US",
  "Nigerian Pidgin": "en-NG",
  Yoruba: "yo-NG",
  Hausa: "ha-NG",
  Igbo: "ig-NG",
  French: "fr-FR",
  Swahili: "sw-KE",
  Arabic: "ar-SA",
  Spanish: "es-ES",
  Portuguese: "pt-PT",
};

function SpeakerIcon({ stop }) {
  return stop ? (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" />
      <path
        d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SpeakButton({ text, language }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Stop talking if the result is replaced or the page closes
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported, text]);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANG[language] || "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex items-center gap-2 rounded-full bg-cobalt px-4 py-2 text-sm font-bold text-white transition hover:bg-cobalt-deep"
    >
      <SpeakerIcon stop={speaking} />
      {speaking ? "Stop" : "Read aloud"}
    </button>
  );
}
