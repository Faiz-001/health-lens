import { useEffect, useRef } from "react";

// [what the label prints, what it means]
const ROWS = [
  ["Amox. 500mg caps", "Amoxicillin, an antibiotic"],
  ["1 cap t.i.d.", "1 capsule, 3 times a day"],
  ["p.c.", "after food"],
  ["x 7/7", "for 7 days"],
];

const STEP = 28; // keyboard movement in px

export default function LensDemo() {
  const boxRef = useRef(null);
  const plainRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const userMoved = useRef(false);

  function place(x, y) {
    const box = boxRef.current;
    if (!box) return;
    const w = box.clientWidth;
    const h = box.clientHeight;
    const r = Math.max(72, Math.min(150, w * 0.3));
    const cx = Math.min(Math.max(x, 0), w);
    const cy = Math.min(Math.max(y, 0), h);
    pos.current = { x: cx, y: cy };
    plainRef.current.style.clipPath = `circle(${r}px at ${cx}px ${cy}px)`;
    const ring = ringRef.current;
    ring.style.width = ring.style.height = `${r * 2}px`;
    ring.style.transform = `translate(${cx - r}px, ${cy - r}px)`;
  }

  // One entrance moment: the lens sweeps the label once, then rests on row 2.
  useEffect(() => {
    const box = boxRef.current;
    const w = box.clientWidth;
    const h = box.clientHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      place(w * 0.32, h * 0.375);
      return;
    }

    const duration = 2800;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      if (userMoved.current) return;
      const t = Math.min((now - start) / duration, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out
      place(w * (0.12 + 0.2 * e), h * (0.375 + 0.36 * Math.sin(e * Math.PI * 2)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    place(w * 0.12, h * 0.375);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function handlePointer(e) {
    userMoved.current = true;
    const rect = boxRef.current.getBoundingClientRect();
    place(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleKey(e) {
    const moves = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, -STEP],
      ArrowDown: [0, STEP],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    userMoved.current = true;
    place(pos.current.x + move[0], pos.current.y + move[1]);
  }

  return (
    <figure>
      <div
        ref={boxRef}
        tabIndex={0}
        role="group"
        aria-label="Example prescription line with a magnifier. Use the arrow keys to move the magnifier."
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onKeyDown={handleKey}
        className="relative cursor-crosshair touch-none select-none"
        style={{ fontSize: "clamp(1.15rem, 5vw, 2.1rem)" }}
      >
        {/* Layer 1: the label as it is printed */}
        <ul aria-hidden="true" className="font-label font-medium text-printed">
          {ROWS.map(([jargon]) => (
            <li key={jargon} className="flex h-[1.9em] items-center whitespace-nowrap px-2">
              {jargon}
            </li>
          ))}
        </ul>

        {/* Layer 2: the plain meaning, only visible through the lens */}
        <ul
          ref={plainRef}
          aria-hidden="true"
          className="absolute inset-0 font-display font-extrabold text-ink"
          style={{ clipPath: "circle(0px at 0 0)" }}
        >
          {ROWS.map(([, plain]) => (
            <li key={plain} className="flex h-[1.9em] items-center whitespace-nowrap px-2">
              <span className="rounded-sm bg-marker px-2 py-0.5 text-[0.9em]">{plain}</span>
            </li>
          ))}
        </ul>

        <div
          ref={ringRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 rounded-full border-[3px] border-marker"
        />
      </div>

      <ul className="sr-only">
        {ROWS.map(([jargon, plain]) => (
          <li key={jargon}>
            {jargon} means {plain}.
          </li>
        ))}
      </ul>

      <figcaption className="mt-3 px-2 text-sm text-printed">
        Move over the label to read it in plain words.
      </figcaption>
    </figure>
  );
}
