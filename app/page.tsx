"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

type Pos = { x: number; y: number };
type Spark = { id: string; x: number; y: number };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const boop = () => {
  // Tiny “boop” using WebAudio (no files needed)
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 520;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 70);
  } catch {
    // ignore
  }
};

export default function Page() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);

  const [noAttempts, setNoAttempts] = useState(0);
  const [saidYes, setSaidYes] = useState(false);

  // NO button position (absolute inside the box)
  const [noPos, setNoPos] = useState<Pos>({ x: 0, y: 0 });

  // “Are you sure?” modal stages after clicking No
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStage, setConfirmStage] = useState(0);

  // Heart trail sparks
  const [sparks, setSparks] = useState<Spark[]>([]);

  const taunts = useMemo(
    () => [
      "Go on… click No 😈",
      "Hmm… suspicious 👀",
      "Why are you like this 😭",
      "I’m getting nervous… 😅",
      "The Yes button is inevitable 😤",
      "Stop resisting destiny 💘",
      "At this point, we’re basically married 😌",
    ],
    []
  );

  const confirmStages = useMemo(
    () => [
      {
        title: "Wait… you clicked No 😳",
        subtitle: "That was an accident. Right?",
        options: ["Oops I misclicked 😅", "Let me reconsider 🥺"],
      },
      {
        title: "Are you *really* sure? 💔",
        subtitle: "My heart just did a Windows shutdown sound.",
        options: ["I was joking 😆", "Ok fine, maybe Yes 😇"],
      },
      {
        title: "Final answer? (I’m sweating) 😭",
        subtitle: "Choose the option that keeps me alive.",
        options: ["Take me back! 😭", "Yes before you cry 😌"],
      },
    ],
    []
  );

  const yesScale = 1 + Math.min(2.8, noAttempts * 0.18); // grows up to ~3.8x

  const moveNoToRandomSpot = () => {
    const box = boxRef.current;
    const noBtn = noRef.current;
    if (!box || !noBtn) return;

    const boxRect = box.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    const padding = 12;
    const maxX = boxRect.width - noRect.width - padding;
    const maxY = boxRect.height - noRect.height - padding;

    const x = clamp(Math.random() * maxX, padding, maxX);
    const y = clamp(Math.random() * maxY, padding, maxY);

    setNoPos({ x, y });
  };

  useLayoutEffect(() => {
    moveNoToRandomSpot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnHeart = (x: number, y: number) => {
    const id = `${performance.now()}-${Math.random()}`;
    setSparks((s) => [...s, { id, x, y }]);
    window.setTimeout(() => {
      setSparks((s) => s.filter((p) => p.id !== id));
    }, 650);
  };

  useEffect(() => {
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 35) return; // throttle
      last = now;
      spawnHeart(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Dodge logic: when pointer gets close, move away
  const dodgeFromPointer = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    const noBtn = noRef.current;
    if (!box || !noBtn) return;

    const boxRect = box.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    const noCenterX = noRect.left + noRect.width / 2;
    const noCenterY = noRect.top + noRect.height / 2;

    const dx = noCenterX - clientX;
    const dy = noCenterY - clientY;
    const dist = Math.hypot(dx, dy);

    const triggerDist = 120;
    if (dist > triggerDist) return;

    boop();
    setNoAttempts((n) => n + 1);

    const push = 190;
    const nx = dx / (dist || 1);
    const ny = dy / (dist || 1);

    const targetX = noPos.x + nx * push + (Math.random() - 0.5) * 160;
    const targetY = noPos.y + ny * push + (Math.random() - 0.5) * 160;

    const padding = 12;
    const maxX = boxRect.width - noRect.width - padding;
    const maxY = boxRect.height - noRect.height - padding;

    setNoPos({
      x: clamp(targetX, padding, maxX),
      y: clamp(targetY, padding, maxY),
    });
  };

  const onNoHover = (e: React.PointerEvent | React.MouseEvent) => {
    // @ts-expect-error mixed events are fine
    dodgeFromPointer(e.clientX, e.clientY);
  };

  const onNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
    setConfirmStage(0);
  };

  const chooseCheesyOption = () => {
    setConfirmStage((s) => {
      const next = s + 1;
      if (next >= confirmStages.length) {
        setConfirmOpen(false);
        setSaidYes(true);
        return s;
      }
      return next;
    });
  };

  const onYesClick = () => {
    try {
      confetti({ particleCount: 160, spread: 70, origin: { y: 0.7 } });
      confetti({ particleCount: 90, spread: 120, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setSaidYes(true);
  };

  useEffect(() => {
    const handleKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-200 via-rose-200 to-red-200 flex items-center justify-center p-6">
      <FloatingHearts />

      {/* Heart trail */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {sparks.map((p) => (
          <span
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-heartpop select-none"
            style={{ left: p.x, top: p.y }}
          >
            💗
          </span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes heartpop {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.0; }
          15% { opacity: 0.85; }
          100% { transform: translate(-50%, -85px) scale(1.3); opacity: 0; }
        }
        .animate-heartpop { animation: heartpop 650ms ease-out forwards; }
      `}</style>

      <div className="relative w-full max-w-2xl rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl p-8 md:p-10 border border-white/50">
        {!saidYes ? (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-rose-700">
              Will you be my Valentine? 💘
            </h1>
            <p className="mt-3 text-base md:text-lg text-rose-900/80">
              I made this website because I like you an unreasonable amount.
            </p>

            <div className="mt-6 rounded-2xl bg-rose-50 p-4 border border-rose-100">
              <p className="text-sm text-rose-900/70">
                No attempts: <span className="font-semibold">{noAttempts}</span>{" "}
                — {taunts[Math.min(taunts.length - 1, Math.floor(noAttempts / 2))]}
              </p>
            </div>

            {/* Buttons playground */}
            <div
              ref={boxRef}
              className="relative mt-8 h-[270px] md:h-[320px] rounded-2xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 overflow-hidden"
              onPointerMove={(e) => dodgeFromPointer(e.clientX, e.clientY)}
            >
              {/* YES */}
              <div className="absolute left-6 top-6">
                <button
                  onClick={onYesClick}
                  style={{ transform: `scale(${yesScale})` }}
                  className="origin-top-left transition-transform duration-200 ease-out rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-4 shadow-lg active:scale-95"
                >
                  Yes 💖
                </button>
              </div>

              {/* NO */}
              <button
                ref={noRef}
                onMouseEnter={onNoHover}
                onPointerEnter={onNoHover}
                onClick={onNoClick}
                style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
                className="absolute left-0 top-0 transition-transform duration-150 ease-out rounded-full bg-white hover:bg-rose-50 text-rose-700 font-bold px-8 py-4 shadow-md border border-rose-200"
              >
                No 🙃
              </button>

              <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-rose-900/50">
                Tip: try to catch “No”… if you can 😈
              </div>
            </div>

            {/* Fun extras */}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <MiniCard title="Date ideas 🍝" text="Dinner, dessert, and a cute walk." />
              <MiniCard title="Inside joke 🤫" text="Add a secret message if she types your nickname." />
              <MiniCard title="Proof 😌" text="On Yes, show a copy button for a sweet message." />
            </div>
          </>
        ) : (
          <Success />
        )}
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-rose-100">
            <h2 className="text-xl font-extrabold text-rose-700">
              {confirmStages[confirmStage]?.title ?? "Okay okay… 😅"}
            </h2>
            <p className="mt-2 text-sm text-rose-900/70">
              {confirmStages[confirmStage]?.subtitle ?? "Choose wisely."}
            </p>

            <div className="mt-6 grid gap-3">
              {(confirmStages[confirmStage]?.options ?? ["Fine… Yes 💘"]).map((t) => (
                <button
                  key={t}
                  onClick={chooseCheesyOption}
                  className="w-full rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-3 shadow-md"
                >
                  {t}
                </button>
              ))}

              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setNoAttempts((n) => n + 2);
                  moveNoToRandomSpot();
                }}
                className="w-full rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-semibold px-5 py-3 border border-rose-200"
              >
                Close (but I’m still judging) 😌
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-rose-100 p-4 shadow-sm">
      <div className="font-bold text-rose-700">{title}</div>
      <div className="mt-1 text-sm text-rose-900/70">{text}</div>
    </div>
  );
}

function Success() {
  const message =
    "I just clicked YES 💖 — Valentine confirmed! 🥰\nNow tell me: dinner + dessert or dessert + dinner? 😌";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert("Copied! Send it to me 😌💘");
    } catch {
      alert("Couldn’t copy on this browser 😅");
    }
  };

  return (
    <div className="text-center py-10">
      <div className="text-6xl">💞</div>
      <h2 className="mt-4 text-3xl font-extrabold text-rose-700">YAYYYYY!!! 🎉</h2>
      <p className="mt-2 text-rose-900/80 text-lg">
        Best decision you’ve made today. Dinner’s on me 😎🍝
      </p>
      <div className="mt-6 grid gap-3 max-w-sm mx-auto">
        <button
          onClick={() => {
            try {
              confetti({ particleCount: 140, spread: 90, origin: { y: 0.7 } });
            } catch {}
          }}
          className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-3 shadow-md"
        >
          More confetti 🎊
        </button>
        <button
          onClick={copy}
          className="rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-semibold px-5 py-3 border border-rose-200"
        >
          Copy “proof” message 📋
        </button>
      </div>
      <p className="mt-4 text-xs text-rose-900/55">
        Screenshot this and send it to me as evidence 😌
      </p>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {hearts.map((i) => (
        <span
          key={i}
          className="absolute text-2xl opacity-40 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
            top: `${80 + Math.random() * 30}%`,
          }}
        >
          💗
        </span>
      ))}
    </div>
  );
}
