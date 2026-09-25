"use client";

import { useState } from "react";
import { BookCover } from "@/components/BookCover";
import { Stars } from "@/components/Stars";
import { SITE, type Book } from "@/data/content";
import { useStore, type LibraryBook } from "@/lib/store";

type Shelf = Book["status"];

const SHELVES: { id: Shelf; title: string; blurb: string }[] = [
  { id: "reading", title: "Reading Now", blurb: "Open on a table somewhere, face down." },
  { id: "want", title: "Want to Read", blurb: "Optimism, in list form." },
  { id: "finished", title: "Finished", blurb: "Proof it occasionally happens." },
];

function whoLabel(by: Book["by"]) {
  if (by === "both") return "both of us";
  return by === "her" ? SITE.herName : SITE.fromName;
}

function BookDetail({ book, onClose }: { book: LibraryBook; onClose: () => void }) {
  const { updateBook, removeBook } = useStore();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [note, setNote] = useState(book.note ?? "");

  return (
    <div className="tape mt-4 rounded-md p-4 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        <BookCover book={book} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold leading-tight">{book.title}</h3>
              <p className="mt-0.5 text-xs text-vhs-dim">
                {book.author} · from {whoLabel(book.by)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim hover:text-vhs-amber"
            >
              close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim">
            <span>shelf</span>
            {SHELVES.map((shelf) => (
              <button
                key={shelf.id}
                type="button"
                onClick={() => updateBook(book.id, { status: shelf.id })}
                className={`rounded-sm border px-2 py-1 transition-colors ${
                  book.status === shelf.id
                    ? "border-vhs-amber text-vhs-amber"
                    : "border-vhs-line text-vhs-dim hover:text-vhs-text"
                }`}
              >
                {shelf.title}
              </button>
            ))}
          </div>

          {book.status === "reading" ? (
            <div className="mt-4">
              <label
                htmlFor={`progress-${book.id}`}
                className="text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim"
              >
                how far in · {book.progress ?? 0}%
              </label>
              <input
                id={`progress-${book.id}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={book.progress ?? 0}
                onChange={(e) => updateBook(book.id, { progress: Number(e.target.value) })}
                className="mt-2 w-full accent-[var(--color-vhs-amber)]"
              />
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim">
            <span>verdict</span>
            <Stars value={book.rating ?? 0} onChange={(v) => updateBook(book.id, { rating: v })} />
          </div>

          <textarea
            className="field mt-4 min-h-[70px]"
            placeholder="notes, quotes, grievances"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => updateBook(book.id, { note })}
            aria-label={`Notes on ${book.title}`}
          />

          <div className="mt-3 flex gap-3 text-[0.6rem] uppercase tracking-[0.2em]">
            {confirmRemove ? (
              <>
                <button
                  type="button"
                  onClick={() => removeBook(book.id)}
                  className="text-vhs-magenta hover:underline"
                >
                  really remove?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="text-vhs-line hover:text-vhs-text"
                >
                  keep it
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="text-vhs-dim hover:text-vhs-magenta"
              >
                remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBookForm() {
  const { addBook } = useStore();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [by, setBy] = useState<Book["by"]>("her");
  const [status, setStatus] = useState<Shelf>("want");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        addBook({ title, author, by, status });
        setTitle("");
        setAuthor("");
      }}
      className="tape mt-8 grid gap-2 rounded-md border-dashed p-4 sm:grid-cols-[1.3fr_1fr_0.8fr_0.8fr_auto]"
    >
      <input
        className="field"
        placeholder="add a book…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Book title"
      />
      <input
        className="field"
        placeholder="author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        aria-label="Author"
      />
      <select
        className="field"
        value={by}
        onChange={(e) => setBy(e.target.value as Book["by"])}
        aria-label="Who recommended it"
      >
        <option value="her">from {SITE.herName}</option>
        <option value="me">from {SITE.fromName}</option>
        <option value="both">both of us</option>
      </select>
      <select
        className="field"
        value={status}
        onChange={(e) => setStatus(e.target.value as Shelf)}
        aria-label="Shelf"
      >
        <option value="want">want to read</option>
        <option value="reading">reading now</option>
        <option value="finished">finished</option>
      </select>
      <button
        type="submit"
        className="rounded-sm border border-vhs-line px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-cyan hover:border-vhs-cyan"
      >
        + add
      </button>
    </form>
  );
}

export function Bookshelf() {
  const { ready, books } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [whose, setWhose] = useState<"all" | Book["by"]>("all");

  if (!ready) return <div className="h-64 animate-pulse rounded-md bg-vhs-panel" />;

  const visible = books.filter((b) => whose === "all" || b.by === whose || b.by === "both");
  const openBook = books.find((b) => b.id === open);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim">
        <span>collection</span>
        {(["all", "her", "me"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setWhose(id)}
            className={`rounded-sm border px-2.5 py-1 transition-colors ${
              whose === id
                ? "border-vhs-amber text-vhs-amber"
                : "border-vhs-line text-vhs-dim hover:text-vhs-text"
            }`}
          >
            {id === "all" ? "everything" : `from ${id === "her" ? SITE.herName : SITE.fromName}`}
          </button>
        ))}
      </div>

      {openBook ? <BookDetail book={openBook} onClose={() => setOpen(null)} /> : null}

      <div className="mt-6 space-y-10">
        {SHELVES.map((shelf) => {
          const shelved = visible.filter((b) => b.status === shelf.id);
          return (
            <section key={shelf.id}>
              <div className="flex items-baseline gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-vhs-text">
                  {shelf.title}
                </h2>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-vhs-line">
                  {shelved.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-vhs-dim">{shelf.blurb}</p>

              {shelved.length === 0 ? (
                <p className="mt-4 text-xs text-vhs-line">Nothing on this shelf yet.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-5">
                  {shelved.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => setOpen(open === book.id ? null : book.id)}
                      className="group text-left transition-transform hover:-translate-y-1"
                    >
                      <BookCover book={book} />
                      <div className="mt-2 w-28">
                        <div className="truncate text-[0.7rem] font-bold">{book.title}</div>
                        <div className="truncate text-[0.6rem] text-vhs-dim">{book.author}</div>
                        {book.status === "reading" && book.progress ? (
                          <div className="mt-1 h-0.5 w-full bg-vhs-line">
                            <div
                              className="h-full"
                              style={{ width: `${book.progress}%`, background: book.color }}
                            />
                          </div>
                        ) : null}
                        {book.rating ? (
                          <div className="mt-1">
                            <Stars value={book.rating} />
                          </div>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <AddBookForm />
    </div>
  );
}
