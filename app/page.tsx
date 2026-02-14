"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

type Pos = { x: number; y: number };
type Spark = { id: string; x: number; y: number };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const makeId = () => `${performance.now()}-${Math.random()}`;

const boop = () => {
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
  } catch {}
};

const playOurSong = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const g = ctx.createGain();
    g.gain.value = 0.02;
    g.connect(ctx.destination);

    const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25];
    const start = ctx.currentTime + 0.02;

    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq;
      o.connect(g);
      o.start(start + i * 0.16);
      o.stop(start + i * 0.16 + 0.14);
    });

    setTimeout(() => ctx.close(), 1400);
  } catch {}
};

export default function Page() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);

  const [noAttempts, setNoAttempts] = useState(0);
  const [saidYes, setSaidYes] = useState(false);

  const [noPos, setNoPos] = useState<Pos>({ x: 0, y: 0 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStage, setConfirmStage] = useState(0);

  const [letterOpen, setLetterOpen] = useState(false);

  const [sparks, setSparks] = useState<Spark[]>([]);

  const [eggUnlocked, setEggUnlocked] = useState(false);

  const [memoryOpen, setMemoryOpen] = useState(false);
  const [activeMemory, setActiveMemory] = useState<{ title: string; img: string } | null>(null);

const openMemory = (m: { title: string; img: string }) => {
  setActiveMemory(m);
  setMemoryOpen(true);
};

const closeMemory = () => {
  setMemoryOpen(false);
  setActiveMemory(null);
};

  const taunts = useMemo(
    () => [
      "Go on… click No 😈",
      "Hmm… suspicious 👀",
      "Why are you like this 😭",
      "Erica… don’t do this to me 🥺",
      "The Yes button is inevitable 😤",
      "Stop resisting destiny 💘",
      "At this point, we’re basically married 😌",
    ],
    []
  );

  const confirmStages = useMemo(
    () => [
      {
        title: "Erica… you clicked No 😭",
        subtitle: "My WiFi disconnected and so did my soul.",
        options: ["Okay okay, I panicked 😅", "Let me fix that… Yes 💖"],
      },
      {
        title: "Are you *really* sure, Erica? 💔",
        subtitle: "Because I already imagined our cute dinner.",
        options: ["I was testing you 😌", "Fineee, Yes 😭💘"],
      },
      {
        title: "Final answer?",
        subtitle: "Choose carefully… my heart is deployed to production.",
        options: ["Rollback to Yes 💞", "Approve PR: Be My Valentine 💘"],
      },
    ],
    []
  );

  const yesScale = 1 + Math.min(3.2, noAttempts * 0.18);

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
    const id = makeId();
    setSparks((s) => [...s, { id, x, y }]);
    window.setTimeout(() => {
      setSparks((s) => s.filter((p) => p.id !== id));
    }, 650);
  };

  useEffect(() => {
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 35) return;
      last = now;
      spawnHeart(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      buffer = (buffer + e.key.toLowerCase()).slice(-10);
      if (!eggUnlocked && buffer.includes("erica")) {
        setEggUnlocked(true);
        try {
          confetti({ particleCount: 220, spread: 110, origin: { y: 0.7 } });
        } catch {}
      }
      if (e.key === "Escape") {
        setConfirmOpen(false)
        closeMemory()
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [eggUnlocked]);

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

    const push = 200;
    const nx = dx / (dist || 1);
    const ny = dy / (dist || 1);

    const targetX = noPos.x + nx * push + (Math.random() - 0.5) * 170;
    const targetY = noPos.y + ny * push + (Math.random() - 0.5) * 170;

    const padding = 12;
    const maxX = boxRect.width - noRect.width - padding;
    const maxY = boxRect.height - noRect.height - padding;

    setNoPos({
      x: clamp(targetX, padding, maxX),
      y: clamp(targetY, padding, maxY),
    });
  };

  const onNoHover = (e: React.PointerEvent | React.MouseEvent) => {
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
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.7 } });
      confetti({ particleCount: 120, spread: 120, origin: { y: 0.6 } });
    } catch {}
    setSaidYes(true);
  };

  const yesLabel = useMemo(() => {
    if (noAttempts >= 10) return "Yes, I love you 😌";
    if (noAttempts >= 7) return "Yes, obviously 💘";
    if (noAttempts >= 4) return "Yes, I adore you 💞";
    return "Yes 💖";
  }, [noAttempts]);

  const unlockLevel = useMemo(() => {
    if (noAttempts >= 12) return 3;
    if (noAttempts >= 8) return 2;
    if (noAttempts >= 5) return 1;
    return 0;
  }, [noAttempts]);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-200 via-rose-200 to-red-200 flex items-center justify-center p-6">
      <FloatingHearts />

      <div className="pointer-events-none fixed inset-0 z-50">
        {sparks.map((p) => (
          <span
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-heartPop select-none"
            style={{ left: p.x, top: p.y }}
          >
            💗
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-3xl rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl p-8 md:p-10 border border-white/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-rose-100 px-3 py-1 text-xs text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Erica edition
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-rose-700">
              Erica… will you be my Valentine? 💘
            </h1>
            <p className="mt-3 text-base md:text-lg text-rose-900/80">
              I didn’t just code this for fun. I coded this because I’m completely in love with you.
            </p>
          </div>

          {/* <button
            onClick={() => {
              playOurSong();
              try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } }); } catch {}
            }}
            className="shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-[length:200%_200%] animate-shimmer shadow-md"
            title="A tiny melody—tap again anytime"
          >
            Play our song 🎶
          </button> */}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat pill="No attempts" value={String(noAttempts)} />
          <Stat pill="Yes strength" value={`${Math.round(yesScale * 100)}%`} />
          <Stat pill="Easter egg" value={eggUnlocked ? "Unlocked ✅" : 'Type "erica"…'} />
        </div>

        <div className="mt-4 rounded-2xl bg-rose-50 p-4 border border-rose-100">
          <p className="text-sm text-rose-900/70">
            {taunts[Math.min(taunts.length - 1, Math.floor(noAttempts / 2))]}
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setLetterOpen((v) => !v)}
            className="w-full rounded-2xl bg-white/70 hover:bg-white text-rose-700 font-semibold px-5 py-3 border border-rose-100 shadow-sm flex items-center justify-between"
          >
            <span>Open love letter 💌</span>
            <span className="text-xs opacity-70">{letterOpen ? "close" : "open"}</span>
          </button>

          {letterOpen && (
            <div className="mt-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm animate-letterIn">
              <p className="text-rose-900/80 leading-relaxed">
                Erica,<br />
                I love the way you make ordinary days feel like my favorite days.
                You’re my calm, my chaos, and my happiest yes.
                <br /><br />
                So here I am—deploying my feelings to production—asking you to be my Valentine.
                <br /><br />
                Love,<br />
                Your favorite developer 😌💘
              </p>
            </div>
          )}
        </div>

        <div
          ref={boxRef}
          className="relative mt-8 h-[300px] md:h-[350px] rounded-2xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 overflow-hidden"
          onPointerMove={(e) => dodgeFromPointer(e.clientX, e.clientY)}
        >
          <div className="absolute left-6 top-6">
            <button
              onClick={onYesClick}
              style={{ transform: `scale(${yesScale})` }}
              className="origin-top-left transition-transform duration-200 ease-out rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-4 shadow-lg active:scale-95"
            >
              {yesLabel}
            </button>
          </div>

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

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-rose-700">Memories unlocked 💞</h3>
            <span className="text-xs text-rose-900/50">
              Unlock more by trying “No” (or just click “Yes” like a legend)
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <MemoryCard title="Memory #1" unlocked={unlockLevel >= 1} img="/memories/memory-1.png" hint="Unlock at 5 No attempts" onOpen={openMemory} />

            <MemoryCard title="Memory #2" unlocked={unlockLevel >= 2} img="/memories/memory-2.png" hint="Unlock at 8 No attempts" onOpen={openMemory} />

            <MemoryCard title="Memory #3" unlocked={unlockLevel >= 3} img="/memories/memory-3.png" hint="Unlock at 12 No attempts" onOpen={openMemory} />
          </div>
        </div>

        {saidYes && <Success />}
      </div>

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

      {memoryOpen && activeMemory && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 p-4 grid place-items-center"
          onClick={closeMemory}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-rose-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100">
              <div className="font-extrabold text-rose-700">{activeMemory.title}</div>
              <button
                onClick={closeMemory}
                className="rounded-xl px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50 border border-rose-100"
              >
                Close ✕
              </button>
            </div>

            <div className="bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeMemory.img}
                alt={activeMemory.title}
                className="w-full max-h-[80vh] object-contain"
              />
            </div>

            <div className="px-5 py-4 text-sm text-rose-900/70 bg-white">
              Tap outside the image (or Close) to go back 💞
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ pill, value }: { pill: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-rose-100 p-4 shadow-sm">
      <div className="text-xs text-rose-900/55">{pill}</div>
      <div className="mt-1 text-lg font-extrabold text-rose-700">{value}</div>
    </div>
  );
}

function MemoryCard({
  title,
  unlocked,
  img,
  hint,
  onOpen,
}: {
  title: string;
  unlocked: boolean;
  img: string;
  hint: string;
  onOpen: (m: { title: string; img: string }) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => unlocked && onOpen({ title, img })}
      className={[
        "text-left rounded-2xl border border-rose-100 bg-white/70 overflow-hidden shadow-sm",
        "transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-300",
        unlocked ? "cursor-pointer" : "opacity-80 cursor-not-allowed",
      ].join(" ")}
      aria-disabled={!unlocked}
      disabled={!unlocked}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-rose-700">{title}</div>
        <div className="text-xs text-rose-900/55">{unlocked ? "Tap to view 👆" : hint}</div>
      </div>

      <div className="relative aspect-video bg-rose-50">
        {unlocked ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-rose-900/50 text-sm">🔒 Locked</div>
        )}
      </div>

      <div className="px-4 py-3 text-xs text-rose-900/55">
        Replace images in <code className="font-mono">public/memories</code> with your real photos.
      </div>
    </button>
  );
}

function Success() {
  const message = "Erica, I clicked YES 💖 — Valentine confirmed! 🥰\nNow tell me: dinner + dessert or dessert + dinner? 😌";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert("Copied! Send it to me 😌💘");
    } catch {
      alert("Couldn’t copy on this browser 😅");
    }
  };

  return (
    <div className="absolute inset-0 z-40 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-100 grid place-items-center p-8">
      <div className="text-center max-w-lg">
        <div className="text-6xl">💞</div>
        <h2 className="mt-4 text-3xl font-extrabold text-rose-700">YAYYYYY!!! 🎉</h2>
        <p className="mt-3 text-rose-900/80 text-lg">
          Erica, I’m so grateful I get to love you. Thank you for being my favorite person in every timeline.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            onClick={() => {
              try { confetti({ particleCount: 160, spread: 100, origin: { y: 0.7 } }); } catch {}
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
          <button
            className="rounded-2xl bg-white/60 hover:bg-white text-rose-700 font-semibold px-5 py-3 border border-rose-100"
            onClick={() => window.location.reload()}
          >
            Replay 😈
          </button>
        </div>

        <p className="mt-4 text-xs text-rose-900/55">
          (P.S. Type “erica” anywhere for a little surprise ✨)
        </p>
      </div>
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
          className="absolute text-2xl opacity-40 animate-floatUp"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${7 + Math.random() * 6}s`,
            top: `${80 + Math.random() * 30}%`,
          }}
        >
          💗
        </span>
      ))}
    </div>
  );
}
