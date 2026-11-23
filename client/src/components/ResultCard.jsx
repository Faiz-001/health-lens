import SpeakButton from "./SpeakButton.jsx";

// Plain text version of the result, used by the read-aloud button
function toSpeech(r) {
  const parts = [r.summary];
  (r.items || []).forEach((i) =>
    parts.push([i.name, i.whatItIs, i.howItIsUsed].filter(Boolean).join(". "))
  );
  if (r.whenToSeekCare?.length) {
    parts.push(`Get medical help if: ${r.whenToSeekCare.join(". ")}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Detail({ title, children }) {
  return (
    <div className="mt-4">
      <h4 className="font-bold">{title}</h4>
      {children}
    </div>
  );
}

export default function ResultCard({ result, language }) {
  const items = result.items || [];
  const careList = result.whenToSeekCare || [];
  const questions = result.questionsToAsk || [];
  const verified = result.verified || [];

  return (
    <section aria-label="Your explanation" className="space-y-10">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-extrabold tracking-tight">In plain words</h2>
          <SpeakButton text={toSpeech(result)} language={language} />
        </div>

        <p className="mt-4 max-w-prose whitespace-pre-line text-xl leading-relaxed">
          {result.summary}
        </p>

        {verified.length > 0 ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-verified px-4 py-1.5 text-sm font-bold text-white">
            <CheckIcon />
            Checked against official FDA drug labels: {verified.map((v) => v.ingredient).join(", ")}
          </p>
        ) : (
          items.length > 0 && (
            <p className="mt-4 max-w-prose text-sm text-muted">
              We could not match this to an official drug label, so this explanation is
              general. Please confirm it with a pharmacist.
            </p>
          )
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-8">
          {items.map((item, idx) => (
            <article key={`${item.name}-${idx}`} className="border-t-[3px] border-ink pt-4">
              <h3 className="text-2xl font-extrabold leading-tight">
                <span className="box-decoration-clone rounded-sm bg-marker px-1.5">
                  {item.name}
                </span>
              </h3>
              <p className="mt-1 text-sm capitalize text-muted">{item.type || "other"}</p>

              {item.whatItIs && (
                <Detail title="What it is">
                  <p className="max-w-prose">{item.whatItIs}</p>
                </Detail>
              )}

              {item.howItIsUsed && (
                <Detail title="How it is used">
                  <p className="max-w-prose">{item.howItIsUsed}</p>
                </Detail>
              )}

              {item.commonWarnings?.length > 0 && (
                <Detail title="Good to know">
                  <ul className="max-w-prose list-disc space-y-1 pl-5 marker:text-cobalt">
                    {item.commonWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </Detail>
              )}
            </article>
          ))}
        </div>
      )}

      {careList.length > 0 && (
        <div className="rounded-3xl bg-signal p-6 text-white sm:p-7">
          <h3 className="text-2xl font-extrabold">Get medical help if you notice</h3>
          <ul className="mt-3 max-w-prose list-disc space-y-1.5 pl-5 text-lg marker:text-white">
            {careList.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {questions.length > 0 && (
        <div className="border-t-[3px] border-ink pt-4">
          <h3 className="text-2xl font-extrabold">Ask your pharmacist or doctor</h3>
          <ul className="mt-3 max-w-prose list-disc space-y-1.5 pl-5 marker:text-cobalt">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
