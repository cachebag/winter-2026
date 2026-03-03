import { useState, useRef, useEffect, useCallback } from "react";
import { parts } from "./data";

function Flashcard({
  front,
  back,
  flipped,
  onFlip,
}: {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
}) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(208);

  useEffect(() => {
    const fh = frontRef.current?.scrollHeight ?? 0;
    const bh = backRef.current?.scrollHeight ?? 0;
    setHeight(Math.max(208, fh, bh));
  }, [front, back]);

  return (
    <div
      onClick={onFlip}
      className="cursor-pointer select-none [perspective:1000px]"
    >
      <div
        style={{ height }}
        className={`relative w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        <div
          ref={frontRef}
          className="absolute inset-0 flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-6 sm:p-6 text-center [backface-visibility:hidden]"
        >
          <p className="text-base sm:text-lg font-medium text-zinc-100 whitespace-pre-line">
            {front}
          </p>
        </div>
        <div
          ref={backRef}
          className="absolute inset-0 flex items-center justify-center rounded-xl border border-emerald-800 bg-emerald-950 px-5 py-6 sm:p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <p className="text-sm sm:text-base text-emerald-100 whitespace-pre-line">
            {back}
          </p>
        </div>
      </div>
    </div>
  );
}

function PartSection({
  title,
  cards,
  open,
  onToggle,
  active,
  onActivate,
}: {
  title: string;
  cards: { front: string; back: string }[];
  open: boolean;
  onToggle: () => void;
  active: boolean;
  onActivate: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(cards.length - 1, i + 1));
    setFlipped(false);
  }, [cards.length]);

  const toggleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleGotIt = () => {
    setMastered((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const handleReviewAgain = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === " ") {
        e.preventDefault();
        toggleFlip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, open, goPrev, goNext, toggleFlip]);

  return (
    <div
      ref={sectionRef}
      onClick={onActivate}
      className={`rounded-2xl border bg-zinc-900 p-4 sm:p-6 transition-colors ${active && open ? "border-emerald-700" : "border-zinc-800"}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
          onActivate();
        }}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className={`w-4 h-4 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 truncate">
            {title}
          </h2>
        </div>
        <span className="text-xs text-zinc-500 shrink-0">
          {mastered.size} / {cards.length} mastered
        </span>
      </button>

      {open && (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {index + 1} / {cards.length}
              {mastered.has(index) && (
                <span className="ml-2 text-emerald-500">&#10003; mastered</span>
              )}
            </p>
            <div className="flex items-center gap-3">
              {mastered.size > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMastered(new Set());
                  }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition"
                >
                  Reset progress
                </button>
              )}
              {index > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(0);
                    setFlipped(false);
                  }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition"
                >
                  Restart
                </button>
              )}
            </div>
          </div>
          <div className="mb-4 flex gap-0.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                  setFlipped(false);
                }}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === index
                    ? "bg-emerald-500"
                    : mastered.has(i)
                      ? "bg-emerald-900"
                      : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <Flashcard
            key={`${title}-${index}`}
            front={cards[index].front}
            back={cards[index].back}
            flipped={flipped}
            onFlip={toggleFlip}
          />
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGotIt();
              }}
              className="rounded-lg bg-emerald-900 px-5 py-2.5 text-sm text-emerald-200 active:bg-emerald-700 transition hover:bg-emerald-800"
            >
              Got It
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReviewAgain();
              }}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300 active:bg-zinc-600 transition hover:bg-zinc-700"
            >
              Review Again
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={index === 0}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300 active:bg-zinc-600 transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={index === cards.length - 1}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300 active:bg-zinc-600 transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 px-3 sm:px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-zinc-100">
          CSC-4420 Midterm Flashcards
        </h1>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-zinc-500">
          Tap a card to flip it. Use arrow keys and space to navigate.
        </p>
        <div className="space-y-4 sm:space-y-5">
          {parts.map((part, i) => (
            <PartSection
              key={part.title}
              title={part.title}
              cards={part.cards}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              active={activeIndex === i}
              onActivate={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
