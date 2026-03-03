import { useState, useRef, useEffect } from "react";
import { parts } from "./data";

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
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
      onClick={() => setFlipped(!flipped)}
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
}: {
  title: string;
  cards: { front: string; back: string }[];
}) {
  const [index, setIndex] = useState(0);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <h2 className="mb-1 text-lg sm:text-xl font-semibold text-zinc-100">
        {title}
      </h2>
      <p className="mb-4 text-sm text-zinc-500">
        {index + 1} / {cards.length}
      </p>
      <Flashcard
        key={`${title}-${index}`}
        front={cards[index].front}
        back={cards[index].back}
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300 active:bg-zinc-600 transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
          disabled={index === cards.length - 1}
          className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300 active:bg-zinc-600 transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 px-3 sm:px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-zinc-100">
          CSC-4420 Midterm Flashcards
        </h1>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-zinc-500">
          Tap a card to flip it.
        </p>
        <div className="space-y-6 sm:space-y-8">
          {parts.map((part) => (
            <PartSection
              key={part.title}
              title={part.title}
              cards={part.cards}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
